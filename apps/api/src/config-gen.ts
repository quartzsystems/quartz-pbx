// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

import { writeFile } from 'fs/promises';
import type { Extension, Trunk, InboundRoute, OutboundRoute, OutboundRoutePattern, OutboundRouteTrunk } from '@prisma/client';

// ── Enriched types ────────────────────────────────────────────────────────────

export type EnrichedOutboundRoute = OutboundRoute & {
  patterns: OutboundRoutePattern[];
  trunks: (OutboundRouteTrunk & { trunk: Trunk })[];
};

// ── Extensions (PJSIP) ────────────────────────────────────────────────────────

export function extensionToPjsip(ext: Extension): string {
  const callerId = ext.callerId ?? `${ext.name} <${ext.extension}>`;
  return `; Extension ${ext.extension} — ${ext.name}
[${ext.extension}]
type=endpoint
auth=${ext.extension}-auth
aors=${ext.extension}-aor
context=${ext.context}
callerid=${callerId}
allow=ulaw,alaw,g722
direct_media=no

[${ext.extension}-auth]
type=auth
auth_type=userpass
username=${ext.extension}
password=${ext.password}

[${ext.extension}-aor]
type=aor
max_contacts=5
remove_existing=yes
`;
}

// ── Trunk config generators ───────────────────────────────────────────────────

function trunkToPjsip(trunk: Trunk): string {
  const reg = trunk.register
    ? `\n[${trunk.name}-reg]\ntype=registration\noutbound_auth=${trunk.name}-auth\nserver_uri=sip:${trunk.host}\nclient_uri=sip:${trunk.username}@${trunk.host}\nretry_interval=60\nexpiration=3600\n`
    : '';
  return `; Trunk ${trunk.name} (PJSIP) — ${trunk.host}
[${trunk.name}]
type=endpoint
auth=${trunk.name}-auth
aors=${trunk.name}-aor
context=${trunk.context}
allow=${trunk.codecs}
from_user=${trunk.username}
from_domain=${trunk.host}
outbound_auth=${trunk.name}-auth
direct_media=no

[${trunk.name}-auth]
type=auth
auth_type=userpass
username=${trunk.username}
password=${trunk.password}

[${trunk.name}-aor]
type=aor
contact=sip:${trunk.host}

[${trunk.name}-identify]
type=identify
endpoint=${trunk.name}
match=${trunk.host}
${reg}`;
}

function trunkToSip(trunk: Trunk): string {
  return `; Trunk ${trunk.name} (chan_sip) — ${trunk.host}
[${trunk.name}]
type=peer
host=${trunk.host}
username=${trunk.username}
secret=${trunk.password}
fromuser=${trunk.username}
fromdomain=${trunk.host}
context=${trunk.context}
allow=${trunk.codecs}
insecure=port,invite
qualify=yes
canreinvite=no
dtmfmode=rfc2833
register=${trunk.register ? 'yes' : 'no'}
`;
}

function trunkToIax2(trunk: Trunk): string {
  return `; Trunk ${trunk.name} (IAX2) — ${trunk.host}
[${trunk.name}]
type=peer
host=${trunk.host}
username=${trunk.username}
secret=${trunk.password}
context=${trunk.context}
allow=${trunk.codecs}
qualify=yes
trunk=yes
`;
}

function trunkToConfig(trunk: Trunk): string {
  switch (trunk.type) {
    case 'SIP':  return trunkToSip(trunk);
    case 'IAX2': return trunkToIax2(trunk);
    default:     return trunkToPjsip(trunk);
  }
}

function dialTech(type: string): string {
  switch (type) {
    case 'SIP':  return 'SIP';
    case 'IAX2': return 'IAX2';
    default:     return 'PJSIP';
  }
}

// ── Full config builders ──────────────────────────────────────────────────────

export function buildPjsipConf(extensions: Extension[], trunks: Trunk[]): string {
  const pjsipTrunks = trunks.filter((t) => t.type === 'PJSIP');
  return `; ============================================================
; Quartz PBX — PJSIP configuration
; Last updated: ${new Date().toISOString()}
; #include this file in pjsip.conf
; ============================================================

[transport-udp]
type=transport
protocol=udp
bind=0.0.0.0:5060

; ===== Extensions =====

${extensions.map(extensionToPjsip).join('\n')}
; ===== PJSIP Trunks =====

${pjsipTrunks.map(trunkToConfig).join('\n')}`;
}

export function buildSipConf(trunks: Trunk[]): string {
  const sipTrunks = trunks.filter((t) => t.type === 'SIP');
  if (!sipTrunks.length) return '; No SIP (chan_sip) trunks configured\n';
  return `; ============================================================
; Quartz PBX — chan_sip configuration
; Last updated: ${new Date().toISOString()}
; #include this file in sip.conf
; ============================================================

${sipTrunks.map(trunkToConfig).join('\n')}`;
}

export function buildIax2Conf(trunks: Trunk[]): string {
  const iaxTrunks = trunks.filter((t) => t.type === 'IAX2');
  if (!iaxTrunks.length) return '; No IAX2 trunks configured\n';
  return `; ============================================================
; Quartz PBX — IAX2 configuration
; Last updated: ${new Date().toISOString()}
; #include this file in iax.conf
; ============================================================

${iaxTrunks.map(trunkToConfig).join('\n')}`;
}

// ── Dialplan ──────────────────────────────────────────────────────────────────

function buildOutboundPatternBlock(pattern: string, route: EnrichedOutboundRoute): string {
  const orderedTrunks = [...route.trunks].sort((a, b) => a.order - b.order);
  const lines: string[] = [];

  lines.push(`; Outbound route: ${route.name} — pattern: ${pattern}`);
  lines.push(`exten => ${pattern},1,NoOp(Quartz outbound: ${route.name})`);

  // Caller ID override
  if (route.callerId) {
    lines.push(`exten => ${pattern},n,Set(CALLERID(all)=${route.callerId})`);
  }

  // Digit manipulation
  if (route.stripDigits > 0) {
    lines.push(`exten => ${pattern},n,Set(OUTEXTEN=\${EXTEN:${route.stripDigits}})`);
  } else {
    lines.push(`exten => ${pattern},n,Set(OUTEXTEN=\${EXTEN})`);
  }
  if (route.prepend) {
    lines.push(`exten => ${pattern},n,Set(OUTEXTEN=${route.prepend}\${OUTEXTEN})`);
  }

  // Dial each trunk in order — sequential failover
  if (orderedTrunks.length > 0) {
    for (const rt of orderedTrunks) {
      const tech = dialTech(rt.trunk.type);
      lines.push(`exten => ${pattern},n,Dial(${tech}/\${OUTEXTEN}@${rt.trunk.name},30,rTt)`);
    }
  } else {
    lines.push(`exten => ${pattern},n,NoOp(No trunks configured for this route)`);
  }

  lines.push(`exten => ${pattern},n,Hangup()`);
  return lines.join('\n');
}

export function buildDialplanConf(
  inbound: InboundRoute[],
  outbound: EnrichedOutboundRoute[],
): string {
  const sortedInbound = [...inbound].sort((a, b) => {
    if (a.did && !b.did) return -1;
    if (!a.did && b.did) return 1;
    return a.priority - b.priority;
  });

  const sortedOutbound = [...outbound].sort((a, b) => a.priority - b.priority);

  const inboundBlock = sortedInbound.length
    ? sortedInbound.map((r) => {
        const exten = r.did ?? '_.';
        const dest =
          r.destinationType === 'extension'
            ? `Goto(from-internal,${r.destination},1)`
            : `Goto(${r.destination},s,1)`;
        return `; Inbound route: ${r.name}${r.did ? ` (DID: ${r.did})` : ' (catch-all)'}
exten => ${exten},1,NoOp(Quartz inbound: ${r.name})
exten => ${exten},n,${dest}
exten => ${exten},n,Hangup()`;
      }).join('\n\n')
    : '; No inbound routes configured';

  const outboundBlock = sortedOutbound.length
    ? sortedOutbound.flatMap((route) =>
        route.patterns.map((p) => buildOutboundPatternBlock(p.pattern, route))
      ).join('\n\n')
    : '; No outbound routes configured';

  return `; ============================================================
; Quartz PBX — dialplan configuration
; Last updated: ${new Date().toISOString()}
; #include this file in extensions.conf
; ============================================================

[from-trunk-quartz]
${inboundBlock}

[outbound-routes-quartz]
${outboundBlock}
`;
}

// ── Write helpers ─────────────────────────────────────────────────────────────

async function writeConf(envKey: string, defaultPath: string, content: string): Promise<void> {
  const path = process.env[envKey] ?? defaultPath;
  try {
    await writeFile(path, content, 'utf-8');
    console.log(`[config] Wrote ${path}`);
  } catch (err) {
    console.warn(`[config] Could not write ${path}:`, (err as Error).message);
  }
}

export async function writeAllConf(
  extensions: Extension[],
  trunks: Trunk[],
  inbound: InboundRoute[],
  outbound: EnrichedOutboundRoute[],
): Promise<void> {
  await Promise.all([
    writeConf('ASTERISK_PJSIP_CONFIG_PATH',     '/etc/asterisk/pjsip_quartz.conf',       buildPjsipConf(extensions, trunks)),
    writeConf('ASTERISK_SIP_CONFIG_PATH',        '/etc/asterisk/sip_quartz.conf',         buildSipConf(trunks)),
    writeConf('ASTERISK_IAX_CONFIG_PATH',        '/etc/asterisk/iax_quartz.conf',         buildIax2Conf(trunks)),
    writeConf('ASTERISK_DIALPLAN_CONFIG_PATH',   '/etc/asterisk/extensions_quartz.conf',  buildDialplanConf(inbound, outbound)),
  ]);
}

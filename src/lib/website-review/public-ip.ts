import { isIP } from "node:net";

function ipv4ToInt(ip: string) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return null;
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function inCidr(ip: number, network: string, bits: number) {
  const net = ipv4ToInt(network);
  if (net == null) return false;
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ip & mask) === (net & mask);
}

function isPublicIPv4(address: string) {
  const n = ipv4ToInt(address);
  if (n == null) return false;
  if (inCidr(n, "0.0.0.0", 8)) return false;
  if (inCidr(n, "10.0.0.0", 8)) return false;
  if (inCidr(n, "100.64.0.0", 10)) return false;
  if (inCidr(n, "127.0.0.0", 8)) return false;
  if (inCidr(n, "169.254.0.0", 16)) return false;
  if (inCidr(n, "172.16.0.0", 12)) return false;
  if (inCidr(n, "192.0.2.0", 24)) return false;
  if (inCidr(n, "192.168.0.0", 16)) return false;
  if (inCidr(n, "198.18.0.0", 15)) return false;
  if (inCidr(n, "198.51.100.0", 24)) return false;
  if (inCidr(n, "203.0.113.0", 24)) return false;
  if (inCidr(n, "224.0.0.0", 4)) return false;
  return true;
}

function firstHextet(address: string) {
  const compact = address.split("%")[0].toLowerCase();
  if (compact.startsWith("::")) return 0;
  const first = compact.split(":")[0];
  const value = Number.parseInt(first, 16);
  return Number.isFinite(value) ? value : 0;
}

function isPublicIPv6(address: string) {
  const host = address.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "::" || host === "::1") return false;
  const mapped = host.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mapped) return isPublicIPv4(mapped[1]);
  const first = firstHextet(host);
  if ((first & 0xfe00) === 0xfc00) return false; // unique local
  if ((first & 0xffc0) === 0xfe80) return false; // link-local
  if ((first & 0xff00) === 0xff00) return false; // multicast
  if (first === 0x2001 && host.startsWith("2001:db8:")) return false; // documentation
  return true;
}

/** True only for public unicast addresses. Loopback, private, link-local, CGNAT, multicast, and documentation ranges fail. */
export function isPublicUnicast(address: string) {
  const version = isIP(address);
  if (version === 4) return isPublicIPv4(address);
  if (version === 6) return isPublicIPv6(address);
  return false;
}

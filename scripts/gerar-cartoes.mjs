// Gera os cartões SVG dos projetos e a faixa de números usados no README.
// Uso: node scripts/gerar-cartoes.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const projetos = [
  { slug: "simulacra", titulo: "Teste de sistemas distribuídos por simulação determinística", numero: "8.000+", legenda: "sementes sem violação no Raft correto", stack: ["Go", "React", "TypeScript"], testes: 66, bg: "#0b1020", ink: "#e6ecff", accent: "#5eead4" },
  { slug: "razao", titulo: "Livro-razão de partidas dobradas com commit em grupo", numero: "73×", legenda: "mais vazão: 11.386 transações por segundo", stack: ["Go", "PostgreSQL", "React"], testes: 18, bg: "#f4efe4", ink: "#1c2a26", accent: "#0f766e" },
  { slug: "mesa", titulo: "Quadro kanban colaborativo que funciona sem internet", numero: "CRDT", legenda: "escrito do zero: edições simultâneas convergem", stack: ["TypeScript", "React", "Go"], testes: 32, bg: "#fbf6ea", ink: "#1a1a1a", accent: "#b7791f" },
  { slug: "plano", titulo: "Leitor de planos de execução do PostgreSQL", numero: "EXPLAIN", legenda: "onde o tempo foi gasto e como corrigir", stack: ["TypeScript", "Go", "PostgreSQL"], testes: 25, bg: "#0f2a4a", ink: "#eaf2ff", accent: "#7cc4ff" },
  { slug: "trilha", titulo: "Coletor de traces que aponta a causa da lentidão", numero: "5", legenda: "diagnósticos automáticos, do N+1 ao gargalo", stack: ["Go", "OpenTelemetry", "React"], testes: 13, bg: "#0d1b1e", ink: "#e3f4f1", accent: "#2dd4bf" },
  { slug: "cifra", titulo: "Cofre de senhas com criptografia de ponta a ponta", numero: "E2E", legenda: "o servidor guarda tudo e não lê nada", stack: ["TypeScript", "WebCrypto", "Go"], testes: 38, bg: "#f3f0fa", ink: "#16122b", accent: "#6b4bff" },
  { slug: "pauta", titulo: "Editor de texto colaborativo, do CRDT ao cursor", numero: "Peritext", legenda: "formatação concorrente que converge", stack: ["TypeScript", "React", "Go"], testes: 31, bg: "#efeae0", ink: "#151515", accent: "#d6293e" },
  { slug: "fila", titulo: "Fila de jobs sobre PostgreSQL", numero: "3.180/s", legenda: "jobs processados, zero execuções duplicadas", stack: ["Go", "PostgreSQL", "React"], testes: 12, bg: "#e9e7e1", ink: "#121212", accent: "#e8490f" },
  { slug: "busca", titulo: "Motor de busca de texto, com a conta à mostra", numero: "~1 ms", legenda: "por consulta em 50 mil documentos", stack: ["Go", "React", "TypeScript"], testes: 15, bg: "#f2f5fb", ink: "#0b1b3f", accent: "#1d3fff" },
  { slug: "lume", titulo: "Banco chave-valor em árvore LSM", numero: "185 mil/s", legenda: "escritas; reabre 113 MB em 18 ms", stack: ["Go", "React", "TypeScript"], testes: 10, bg: "#130f0c", ink: "#f7ecdd", accent: "#ff6b1a" },
];

const FONT = "'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** Quebra um texto em linhas de até `max` caracteres. */
function linhas(texto, max) {
  const out = [];
  let atual = "";
  for (const palavra of texto.split(" ")) {
    if (atual && (atual + " " + palavra).length > max) {
      out.push(atual);
      atual = palavra;
    } else atual = atual ? atual + " " + palavra : palavra;
  }
  if (atual) out.push(atual);
  return out;
}

function cartao(p) {
  const W = 440;
  const H = 210;
  const titulo = linhas(p.titulo, 40);
  let x = 24;
  const chips = [...p.stack, `${p.testes} testes`]
    .map((s, i) => {
      const w = Math.round(s.length * 6.7 + 18);
      const ultimo = i === p.stack.length;
      const chip = `<g transform="translate(${x} 168)"><rect width="${w}" height="22" rx="11" fill="${ultimo ? p.accent : "none"}" fill-opacity="${ultimo ? 0.18 : 1}" stroke="${p.ink}" stroke-opacity=".35"/><text x="${w / 2}" y="15" text-anchor="middle" font-family="${MONO}" font-size="11" font-weight="600" fill="${p.ink}">${esc(s)}</text></g>`;
      x += w + 6;
      return chip;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(p.slug)}: ${esc(p.titulo)}">
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="${p.bg}" stroke="${p.ink}" stroke-opacity=".25" stroke-width="2"/>
  <rect x="1" y="1" width="8" height="${H - 2}" rx="4" fill="${p.accent}"/>
  <text x="24" y="44" font-family="${FONT}" font-size="26" font-weight="800" fill="${p.ink}" letter-spacing="-0.5">${esc(p.slug)}</text>
  <text x="${W - 22}" y="42" text-anchor="end" font-family="${FONT}" font-size="22" font-weight="800" fill="${p.accent}">${esc(p.numero)}</text>
  ${titulo.map((l, i) => `<text x="24" y="${74 + i * 20}" font-family="${FONT}" font-size="15" font-weight="600" fill="${p.ink}">${esc(l)}</text>`).join("\n  ")}
  <text x="24" y="${84 + titulo.length * 20}" font-family="${FONT}" font-size="13" fill="${p.ink}" fill-opacity=".72">${esc(p.legenda)}</text>
  ${chips}
</svg>
`;
}

function numeros() {
  const itens = [
    ["10", "sistemas construídos do zero"],
    [String(projetos.reduce((n, p) => n + p.testes, 0)), "testes automatizados"],
    ["54 mil", "linhas de Go e TypeScript"],
    ["1", "comando para rodar cada um"],
  ];
  const W = 900;
  const H = 110;
  const col = W / itens.length;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${itens.map((i) => i.join(" ")).join(", ")}">
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="#0d1117" stroke="#30e0ff" stroke-opacity=".5" stroke-width="2"/>
  ${itens
    .map(
      ([n, t], i) => `<g transform="translate(${i * col} 0)">
    ${i ? `<line x1="0" x2="0" y1="24" y2="${H - 24}" stroke="#ffffff" stroke-opacity=".15"/>` : ""}
    <text x="${col / 2}" y="52" text-anchor="middle" font-family="${FONT}" font-size="34" font-weight="800" fill="#30e0ff">${n}</text>
    <text x="${col / 2}" y="80" text-anchor="middle" font-family="${FONT}" font-size="14" fill="#e6edf3">${t}</text>
  </g>`,
    )
    .join("\n  ")}
</svg>
`;
}

mkdirSync("assets/projetos", { recursive: true });
for (const p of projetos) writeFileSync(`assets/projetos/${p.slug}.svg`, cartao(p));
writeFileSync("assets/numeros.svg", numeros());
console.log(`${projetos.length} cartões e a faixa de números gerados em assets/`);

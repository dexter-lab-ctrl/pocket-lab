export const highlightBash = (code) => {
  if (!code) return '';
  let lines = code.split('\n');
  return lines.map(line => {
    if (line.trim().startsWith('#')) return `<span class="text-slate-500 italic">${line}</span>`;
    let processed = line;
    processed = processed.replace(/(\$[a-zA-Z_0-9]+|\$\([^)]+\))/g, '<span class="text-purple-400">$1</span>');
    processed = processed.replace(/(["'])(.*?)\1/g, '<span class="text-yellow-300">"$2"</span>');
    processed = processed.replace(/\b(if|then|else|fi|elif|echo|cat|exit|chmod|mkdir|touch|rm|pkg|proot-distro|dialog|sleep|tmux|crond|crontab|bash|wget|tar|export|grep|awk|sed|tailscaled|tailscale|nohup)\b/g, '<span class="text-blue-400 font-bold">$1</span>');
    return processed;
  }).join('\n');
};

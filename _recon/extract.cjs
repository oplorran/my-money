const fs = require("fs");
const { PDFParse } = require("pdf-parse");
const base = "C:/Users/herme/nextjs/Open/Money Club/Money Club/01-relatorios/";
const files = [["funil-money-club-engenharia-reversa.pdf","_recon/funil-report.txt"],["money-club-roteiro-daniel.pdf","_recon/roteiro-daniel.txt"],["money-club-criativos-reais.pdf","_recon/criativos-reais.txt"]];
(async () => {
  for (const [src, out] of files) {
    try {
      const buf = fs.readFileSync(base + src);
      const parser = new PDFParse({ data: buf });
      const res = await parser.getText();
      fs.writeFileSync(out, res.text);
      console.log(out, res.text.length);
      await parser.destroy();
    } catch (e) { console.log("ERR", src, e.message); }
  }
})();
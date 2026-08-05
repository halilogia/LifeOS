Matematik/Geometri soruları için:
1. Tüm matematiksel ifadeler, formüller ve semboller LaTeX formatında yazılmalıdır. Uygulama KaTeX ile render eder, şu sözdizimi kullanılır:
   - Satır içi (inline) matematik: `$...$` (örn: `$x^2 + 2x - 3 = 0$`, `$\frac{1}{2}$`)
   - Blok/denklem (display) matematik: `$$...$$` (örn: `$$\frac{a}{b} = \frac{c}{d}$$`)
2. Kesirler için `\frac{}{}`, üs için `^`, alt indis için `_`, karekök için `\sqrt{}` kullan (örn: `$\sqrt{16}$`, `$x_1$`, `$\frac{3}{4}$`).
3. Açılar ve geometri birimleri de LaTeX ile yazılmalıdır (örn: `$60^\circ$`, `$m(\widehat{ABC})$`).
4. Eğer grafik okuma, tablo, çizgi grafik veya geometri sorusu ise sorunun hemen altında şeklin nasıl göründüğünü metin olarak tarif et (örn: "Şekilde ABC üçgeninde A=60°, B=x, C=80° verilmiştir.").
5. Şıklardaki ve açıklamadaki tüm matematik de aynı LaTeX sözdizimine uymalıdır — KaTeX'in desteklemediği ortamlara (tikz, equation ortamı vb.) yer verme.
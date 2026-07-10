# Imagens reais dos produtos

Coloque aqui fotos da **embalagem original** de cada produto.

Produtos **sem** arquivo nesta pasta recebem automaticamente um **frasco padrao** com o nome no rotulo.

## Como nomear

Use o **slug** do produto como nome do arquivo:

```
retatrutida-zphc-pen-60-mg.png
testo-cipionato-200mg-10ml.jpg
```

Formatos: `.png`, `.jpg`, `.jpeg`, `.webp` (max 1 MB)

## Sincronizar com a loja

Depois de adicionar imagens, rode:

```bash
node scripts/sync-local-product-images.mjs
node scripts/sync-placeholder-vial-images.mjs
```

O primeiro envia fotos reais desta pasta. O segundo gera o frasco padrao para os demais produtos.

## Slugs

Consulte em **Admin → Produtos** ou na URL do produto na vitrine.
Ex.: `/produto/retatrutida-zphc-pen-60-mg` → arquivo `retatrutida-zphc-pen-60-mg.png`

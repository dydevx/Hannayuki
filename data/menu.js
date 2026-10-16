/* Offizielle Speisekarte: "menu hannayuki moi nhat.pdf", 40 Seiten, Stand 25.08.2026. */
const menuItem = (code, name, category, price, description = "", options = "", allergens = "", page = 0, note = "") => ({
  code: String(code), name, category, price, description, options, allergens, page, note
});

window.MENU_CATEGORIES = [
  "Alle", "Getränke", "Signature Drinks", "Vorspeisen", "Ramen & Pho",
  "Hauptgerichte", "Asian Specials", "Seafood & Hanoi Specials", "Curry & Teriyaki",
  "Nigiri Sushi", "Maki", "Futo Maki", "Premium Rolls", "Frittiertes Sushi",
  "Sushi Platten", "Vegan & Vegetarisch", "Spezial Rolls"
];

window.MENU_DATA = [];

const addBlock = (category, page, rows) => {
  rows.trim().split("\n").forEach((row) => {
    const [code, name, rawPrice, description = "", options = "", allergens = ""] = row.split("|");
    const price = rawPrice === "" ? null : Number(rawPrice);
    window.MENU_DATA.push(menuItem(code, name, category, price, description, options, allergens, page));
  });
};

addBlock("Getränke", 2, `
SD1|Cola, Cola Zero, Fanta, Sprite, Mezzo Mix oder Ginger Ale|3.5|Softdrink nach Wahl|0,33 l
SD2|Mineralwasser|3|Still oder sprudelnd|0,33 l
SD3|Mineralwasser Flasche|6|Still oder sprudelnd|0,75 l
G6|Lychee Saft|4|Auch als Schorle erhältlich|0,33 l
G8|Apfelsaft|4|Auch als Schorle erhältlich|0,33 l
G9|Mangosaft|4|Auch als Schorle erhältlich|0,33 l
G14|Maracujasaft|4|Auch als Schorle erhältlich|0,33 l
G33a|Hefeweizen|4||0,33 l
G33b|Schönbuch Bier|4||0,33 l
G35a|Alkoholfreies Bier|4||0,33 l
G31|Hugo|7|Prosecco, Holunder, Limetten und Minze
G32|Aperol Spritz|7|Prosecco und Aperol
G32b|Kumquat Bombe|7|Prosecco, Kumquats, Limetten, Minze, Ingwer und Holunder
G36|Rotwein|5.7||0,2 l
G37|Weißwein|5.7||0,2 l
G39|Weißwein Schorle|4.7
G40|Rotwein Schorle|4.7
G41|Roséwein|5.7||0,2 l
G15|Kazumi Tee|4.5
G15a|Lemongrass Tee|5|Zitronengras, Ingwer und Honig|Nur im Winter
SAKE|Sake|6||Warm oder kalt
MK|Milchkaffee Spezialitäten|6
`);

addBlock("Signature Drinks", 3, `
SH1|Avocado Lassi|8||Saisonal, bitte anfragen
SH2|Orange Shake|8||Saisonal, bitte anfragen
SH3|Wassermelone Shake|8||Saisonal, bitte anfragen
SH4|Mango Lassi mit Minze|8||Saisonal, bitte anfragen
HG1|Sweet Strawberry|8|Frisch gepresste Limetten, Minze, Erdbeere, Ingwer und Kumquats
HG2|Lychee Deluxe|8|Frisch gepresste Limetten, Minze, Lychee, Ingwer und Kumquats
HG3|Ananas|8|Frisch gepresste Limetten, Minze, Ananas, Ingwer und Kumquats
HG4|Summer Lover|6|Frische Limetten, Soda, Ingwer und Minze
HG5|Great Passion Fruit|7|Frische Limetten, Maracuja, Soda, Minze und Ingwer
HG6|Beautiful Kumquats|7|Frisch gepresste Kumquats
HG7|Ōkina Yume|6|Himbeerlimonade mit Ingwer und Minze
ET1|Kazumi Eistee|8|Frische Kumquats und frisch gepresste Limette
ET2|Zitronengras Eistee|8|Frische Kumquats, Orange, Limetten, Minze und Pfirsich
ET3|Kings of Eistee|8|Lychee, Kumquats, Orange, Melone und Maracuja
ET4|Lychee Eistee|8|Frische Lychee, Limetten, Minze, Tee und Kumquat
ET5|Ananas Eistee|8|Ananas, Limetten, Minze, Tee und Kumquat
`);

addBlock("Vorspeisen", 4, `
1|Nem Thịt|6|Frühlingsrollen mit Schweinefleisch|3 Stück|a,c,4
2|Kokossuppe|6||Fisch, Garnelen, Huhn, Ente oder Tofu|d,7
3|Summer Roll|6|Sommerrollen aus Reispapier, Erdnuss, Koriander, frischem Salat und hausgemachter Soße|Ente: 6 €; Huhn oder Tofu: 7 €; Garnelen: 9 €; roher Lachs, Thunfisch oder Butterfisch: 11 €|4,d,b,1,7
4|Zitronengrassuppe|6||Fisch, Garnelen, Huhn, Ente oder Tofu|d,7
4b|Bánh Cuốn|6|Gerollt mit Garnelenfüllung|2 Stück|a,b,d,1,G,M,7
6|Vịt Sa Lát|8|Ente mit Mango, gemischtem Salat, Erdnuss, Koriander, Avocado und hausgemachter Soße||d,b,1,7
7|Seetangsalat Deluxe|5|Seetangsalat|Mit Mango: 8 €; mit Garnelen und Mango: 11 €|d,b,1,7
8|Nem Tôm|6|Mit Schweinefleisch und Garnelen||d,b,1,7
9|Siu Mai|6|Mit Schweinefleisch und Garnelen||f,1,d,b
10|Nem Chay|5|Vegetarische Frühlingsrollen|6 Stück|1,7
`);

addBlock("Vorspeisen", 5, `
9A|Ha Cao|6|Gedämpfte Teigtaschen mit Garnelen||f,1,d,b
11|Oktopus frittiert|6|Mit Mayonnaise||b,d,g,7,1
12|Crispy Black Tiger Garnelen|6||2 Stück|a,b,d,l,G,M,1,7
13|Gyoza|6||4 Stück, Huhn oder vegetarisch|a,f,7,1
15|Kazumi Takiki|13|Roh, Salat, Kazumi Sauce, scharf|Lachs, Thunfisch, Butterfisch oder gemischt|d,1,7
16|Hannayuki Ente|7|Ente, Salat, Erdnuss und hausgemachte Soße||a,h,l,G,M,1,7
17|Knuspriges Chicken Teriyaki|7|Knuspriges Hähnchen mit Teriyaki||h,d,g,7,1
18|Aubergine Bombe|6|Frittierte Aubergine||a,b,d,l,G,M,1,7
19|Tintenfisch frittiert|7|Mit Mayonnaise||a,b,d,l,G,M,1,7
19a|Japanese Cheese Sticks|4|Frittiert||d,7,1
`);

addBlock("Ramen & Pho", 6, `
R1|Kimchi Ramen|17|Würzige Sesambrühe, Kimchi, Schweinebauch, Frühlingszwiebeln, Bohnensprossen, Sesam und Ei
R2|Hannayuki Ramen|19|Miso Brühe, Schweinebauch, Ei, Frühlingszwiebeln, Sesam und Garnelen
P1|Phở Bò|15|Rinderbrühe, Reisnudeln, Frühlingszwiebeln, Zwiebeln, Koriander, Basilikum, Limette und Chili|Mit Huhn: 15 €; mit Rind: 17 €
`);

addBlock("Ramen & Pho", 7, `
R3|Miso Ramen|17|Miso Brühe, Schweinebauch, Frühlingszwiebeln, Ei und Sesam
R4|Tan Tan Ramen|17|Würzige Sesambrühe, Schweinebauch, Kimchi, Frühlingszwiebeln, Ei und Sesam
R5|Shoyu Ramen|17|Shoyu Brühe, Schweinebauch, Frühlingszwiebeln, Ei und Sesam
`);

addBlock("Hauptgerichte", 8, `
20|Angry Beef|17|Koreanisches Rindfleisch, gebraten mit Gemüse, Reis und Sesam, scharf||a,b,d,l,G,M,1,7
21|Seoul Fire Ika|17|Koreanische Soße mit frischem Gemüse, Reis, Sesam und Tintenfisch, leicht scharf||b,d,l,G
22|Shaolin Bowl|17|Kimchi, Reis, Salat und Kazumi Sauce, leicht scharf|Ente oder Rind: 17 €; Lachs: 19 €|a,b,d,l,G,M,1,7
23|Golden Thai Curry|15|Hokkaido Thai Curry auf frischem Gemüse und Reis|Knusprige Ente, Garnelen oder knuspriges Hähnchen: 17 €; Huhn, Schweinefleisch oder Tofu: 15 €; Jakobsmuscheln: 23 €|a,b,d,l,G,M,1,7
24|Vịt Teriyaki|17|Ente mit Salat, hausgemachtem Teriyaki Reis, Erdnuss, Röstzwiebeln und Koriander||a,b,d,l,G,M,1,7
`);

addBlock("Asian Specials", 9, `
25|Bánh Canh|17|Gebratene Udon Nudeln mit Gemüse, Röstzwiebeln und Erdnuss|Knuspriges Hähnchen: 17 €; Ente oder Rind: 19 €; Huhn, Tofu oder Schweinefleisch: 17 €; Jakobsmuscheln: 23 €|a,b,d,l,G,M,1,7
26|Deep Gold Mango|15|Frisches Saisongemüse in hausgemachter Mango Sauce|Ente oder Garnelen: 17 €; knuspriges Hähnchen: 17 €; Huhn, Tofu oder Schweinefleisch: 15 €|a,b,d,l,G,M,1,7
27|Cơm Bò Hàn Quốc|17|Koreanisches Rindfleisch, gebraten mit Gemüse, Reis und Sesam||a,b,d,l,G,M,1,7
28|Go Chu Jang Sam|17|Koreanische Soße mit frischem Gemüse, Reis, Sesam und Rindfleisch, leicht scharf||a,b,d,l,G,M,1,7
32|Lucky Spring Rolls|17|Schweinefleisch Frühlingsrollen mit Gemüse, Salat, Sushi Reis und Kimchi||f,1,d,b
33|Pan Fried Poulader|19|Gemüse mit Teriyaki Sauce, Sushi Reis, Salat, Gyoza Huhn und Kimchi||a,b,d,L,G,M,1,7
`);

addBlock("Seafood & Hanoi Specials", 10, `
34|Golden Scallop|23|Koreanische Soße mit frischem Gemüse, Reis, Sesam und Jakobsmuscheln, leicht scharf||b,d,L,G,M,1
35|Super Sea Bowl|19|Reis, Kimchi, Salat, roher Fisch und Kazumi Sauce, leicht scharf||a,b,d,L,G,M,1,7
36|Noble Harmony Salmon|19|Gemüse mit Teriyaki Sauce, Reis, Salat, Erdnuss und Röstzwiebeln||f,1,d,b
37|Hà Nội Élégance|17|Reisfadennudeln mit süß-saurer, würziger und salziger Fischsauce und Rindfleisch||a,b,d,L,G,M,1,7
38|Hot Angry Bún|17|Reisnudeln mit Salat, Sauce, Erdnuss, Röstzwiebeln, Koriander und Sojasprossen|Huhn, Schweinefleisch, Tofu, Ente oder Rind|a,b,d,L,G,M,1,7
`);

addBlock("Seafood & Hanoi Specials", 11, `
39|Bún Nem Frühlingsrollen|15|Reisnudeln mit Salat, Salatsauce, Schweinefleisch Frühlingsrollen, Erdnuss, Röstzwiebeln und Koriander||a,b,d,L,G,M,1,7
40|Phở Love|15|Bandnudeln, Salat, Salatsauce, Erdnuss, Röstzwiebeln und Koriander|Ente, Tofu, Rind oder Schweinefleisch|a,b,d,L,G,M,1,7
41|Tokyo Melt|17|Gebratene Udon Nudeln mit Butter Soja Sauce|Garnelen oder Rindfleisch|a,b,d,L,G,M,1,7
42|Ocean Flame|25|Gebratener Tintenfisch mit Salat, Reis und Teriyaki Sauce||a,b,d,L,G,M,1,7
43|Golden Udon|17|Udon Nudeln mit Thai Curry Sauce und Gemüse|Garnelen, Ente, Huhn, Schweinefleisch, Tofu oder knuspriges Hähnchen|a,b,d,L,G,M
`);

addBlock("Seafood & Hanoi Specials", 12, `
45|Phở Trộn|15|Reisbandnudeln mit Salat, Sauce, Erdnuss, Röstzwiebeln, Koriander und Sojasprossen|Knusprige Ente, Garnelen oder knuspriges Hähnchen: 17 €; Huhn, Schweinefleisch oder Tofu: 15 €; Jakobsmuscheln: 23 €|a,b,d,L,G,M,1,7
`);

addBlock("Curry & Teriyaki", 12, `
46|Golden Peanut Curry|15|Erdnuss Curry auf frischem Gemüse und Reis oder Nudeln|Knusprige Ente, Garnelen oder knuspriges Hähnchen: 17 €; Huhn, Schweinefleisch oder Tofu: 15 €; Jakobsmuscheln: 23 €|a,b,d,L,G,M,1,7
47|Phở Curry|15|Auf frischem Gemüse und Nudeln|Knusprige Ente, Garnelen oder knuspriges Hähnchen: 17 €; Huhn, Schweinefleisch oder Tofu: 15 €; Jakobsmuscheln: 23 €|a,b,d,L,G,M,1,7
`);

addBlock("Curry & Teriyaki", 13, `
44|Panang Gold|15|Panang Curry auf frischem Gemüse und Reis|Knusprige Ente, Garnelen oder knuspriges Hähnchen: 17 €; Huhn, Schweinefleisch oder Tofu: 15 €; Jakobsmuscheln: 23 €|a,b,d,L,G,M,1,7
29|Beef Steak Teriyaki|15|Mit Reis, Salat, Teriyaki Sauce, Spargel und Kräuterseitlingen|Knusprige Ente, Garnelen oder knuspriges Hähnchen: 17 €; Huhn, Schweinefleisch oder Tofu: 15 €; Jakobsmuscheln: 23 €|a,b,d,L,G,M,1,7
30|Golden Massaman|15|Massaman Curry auf frischem Gemüse und Nudeln|Knusprige Ente, Garnelen oder knuspriges Hähnchen: 17 €; Huhn, Schweinefleisch oder Tofu: 15 €; Jakobsmuscheln: 23 €|a,b,d,L,G,M,1,7
31|Tokyo Chicken|17|Mit Reis, Salat und Chicken Steak Teriyaki Sauce||a,b,d,L,G,M,1,7
`);

addBlock("Nigiri Sushi", 14, `
313|Sakana Yakinuki Avocado|3.3|Flambierter Butterfisch, Avocado und Sauce
314|Salmon Yakinuki Avocado|3.3|Flambierter Lachs, Avocado und Sauce
315|Tuna Aburi Avocado|3.3|Flambierter Thunfisch, Avocado und Sauce
316|Tuna Aburi Avocado|3|Flambierter Thunfisch, Avocado und Sauce
317|Unagi Nigiri|3.5|Aal
318|Inari Nigiri|2|Gebratene Tofutasche
319|Tamago Nigiri|2|Ei
320|Avocado Nigiri|3|Avocado
321|Spargel Nigiri|3|Spargel
322|Surimi Nigiri|2|Surimi
`);

addBlock("Nigiri Sushi", 15, `
301|Sakana Nigiri|3|Butterfisch
302|Sakana Avocado Nigiri|3.3|Butterfisch und Avocado
303|Sakana Spargel Nigiri|3.3|Butterfisch und Spargel
304|Lachs Rucola Nigiri|3.3|Lachs und Rucola
305|Lachs Avocado Nigiri|3.3|Lachs und Avocado
306|Tuna Rucola Nigiri|3.3|Thunfisch und Rucola
307|Tuna Avocado Nigiri|3.3|Thunfisch und Avocado
308|Lachs Spargel Nigiri|3.3|Lachs und Spargel
309|Tuna Spargel Nigiri|3.3|Thunfisch und Spargel
310|Salmon Nigiri|3|Lachs
311|Maguro Nigiri|3|Thunfisch
`);

addBlock("Futo Maki", 16, `
90|Futo Salmon|10|Frischkäse, Avocado, Gurken, Lachs, Rucola und Surimi|5 Stück
91|Futo Tuna|10|Frischkäse, Avocado, Gurken, Thunfisch, Rucola und Surimi|5 Stück
92|Futo Ebi|11|Frischkäse, Avocado, Gurken, Ei und Garnelen|5 Stück
93|Futo Ebi Tempura|11|Gebackene Garnelen, Avocado, Surimi und Ei|5 Stück
94|Spezial Futo|12|Thunfisch, Avocado, Gurken, Lachs, Rucola und Frischkäse|5 Stück
95|Futo Deluxe|12|Hähnchenspieße, Avocado, Garnelen, Ei, Surimi und Frischkäse|5 Stück
96|Futo Sakana|10|Butterfisch, Gurken, Spargel, Frischkäse und Surimi|5 Stück
97|Futo Oktopus|13|Oktopus, Avocado, Garnelen, Ei, Surimi, Frischkäse und Spargel|5 Stück
`);

addBlock("Maki", 17, `
65|Rucola Maki|4|Frischkäse|6 Stück
603|Kräuterseitling Maki|4|Japanische Kräuterseitlinge|6 Stück
66|Spargel Maki|4|Spargel|6 Stück
604|Frittierter Spargel Maki|5|Frittierter Spargel|6 Stück
601|Mango Maki|4|Mango|6 Stück
605|Vegan Avocado Fry Maki|5|Frittierte Avocado|6 Stück
602|Mozzarella Maki|4|Mozzarella|6 Stück
611|Vegan Wakame Maki|4|Algensalat und Sesam|6 Stück
`);

addBlock("Maki", 18, `
50|Sake Maki|5|Schottischer Lachs|6 Stück
50a|Sake Spargel Maki|5|Lachs und Spargel|6 Stück
51|Tekka Maki|5|Thunfisch|6 Stück
51a|Tuna Spargel Maki|5|Thunfisch und Spargel|6 Stück
52|Ebi Maki|5.5|Garnelen und Sesam|6 Stück
53|Unagi Maki|5.5|Aal und Sesam|6 Stück
54|Edo Maki|5|Lachs und Avocado|6 Stück
54a|Butterfisch Avocado Maki|5|Butterfisch und Avocado|6 Stück
54b|Butterfisch Rucola Maki|5|Butterfisch und Rucola|6 Stück
56|Ebi Avocado Maki|5.5|Garnelen und Avocado|6 Stück
`);

addBlock("Maki", 19, `
57|Gekochter Salmon Maki|5|Frischkäse, Rucola und Mayonnaise|6 Stück
58|Gebratener Tuna Maki|5|Gurken, Frischkäse und Sesam|6 Stück
59a|Rucola Lachs Maki|5|Frischkäse|6 Stück
59b|Rucola Thunfisch Maki|5|Frischkäse|6 Stück
59c|Sakana Maki|5|Butterfisch|6 Stück
60|Avocado Maki|5|Avocado und Sesam|6 Stück
61|Kappa Maki|4|Gurke|6 Stück
62|Surimi Maki|4|Surimi und Sesam|6 Stück
63|Tamago Maki|4|Ei|6 Stück
64|Avocado Tofu Maki|5|Avocado und Tofu|6 Stück
`);

addBlock("Premium Rolls", 20, `
67|Émeraude Kiss|12|Frischkäse, Gurken, Rucola und Lachs, mit Avocado umwickelt und Unagi Sauce|8 Stück
67a|Ocean Seduction|13|Panierte Avocado, Gurken und Frischkäse, umwickelt mit Lachs, Thunfisch, Butterfisch, Garnelen oder Aal|8 Stück
70|Saumon Éclat|10|Lachs, Gurken, Frischkäse und Avocado|8 Stück
70a|Mango Temptation Roll|10|Frischkäse, Spargel, Gurken, Mango, Butterfisch und Sauce|8 Stück
70b|Kings of Aubergine|13|Frischkäse, Avocado, gemischter Fisch und Spargel, mit Aubergine umwickelt und Unagi Sauce|8 Stück
`);

addBlock("Premium Rolls", 21, `
71|Tuna Obsession|10|Thunfisch, Frischkäse, Gurken, Avocado und Tobiko|8 Stück
75|Salmon Queen Roll|13|Gurken, Avocado und Frischkäse, umwickelt mit Lachs, Thunfisch, Butterfisch, Garnelen oder Oktopus|8 Stück
75a|Mango Élite|13|Gurken, Spargel, Mango, Frischkäse und Butterfisch, umwickelt mit Lachs, Thunfisch, Butterfisch, Garnelen oder Oktopus|8 Stück
75b|Scallop Affair|15|Spargel, Lachs, Frischkäse und Kräuterseitlinge, umwickelt mit Jakobsmuscheln|8 Stück
75c|Ocean Prestige|14|Gurken, Frischkäse, Tintenfisch und Spargel, umwickelt mit Lachs und Thunfisch|8 Stück
`);

addBlock("Premium Rolls", 22, `
76|Tuna Queen Roll|13|Avocado, Spargel, Frischkäse und Thunfisch, umwickelt mit Lachs, Thunfisch, Butterfisch, Garnelen oder Oktopus|8 Stück
76a|Golden Melt Roll|12|Gurken, Mozzarella Tempura und Frischkäse, leicht scharf, umwickelt mit Lachs, Thunfisch, Butterfisch oder Garnelen|8 Stück
76b|Black Pearl Roll|15|Avocado, Gurken, Frischkäse, Tobiko und Aal, umwickelt mit Lachs, Thunfisch oder Butterfisch|8 Stück
78|California Dream Roll|12|Surimi, Frischkäse, Gurken und Avocado, umwickelt mit Lachs, Thunfisch, Butterfisch, Garnelen oder Aal|8 Stück
84a|Crazy Ebi Tempural|15|Knusprige Garnelen und Avocado, umwickelt mit Lachs, Thunfisch oder Butterfisch|8 Stück
`);

addBlock("Premium Rolls", 23, `
79|Fire Green Roll|11|Frischkäse, Rucola, Gurke und Mango, umwickelt mit Lachs, Thunfisch, Butterfisch oder Garnelen|8 Stück
79a|Wild Ocean Roll|11|Frischkäse, japanische Kräuterseitlinge, Spargel und Avocado, umwickelt mit Lachs, Thunfisch, Butterfisch, Garnelen oder Aal|8 Stück
79b|Gold Rush Roll|11|Frischkäse, Avocado und Spargel, umwickelt mit Lachs, Thunfisch, Butterfisch, Garnelen oder Aal|8 Stück
79c|Crazy Deluxe|11|Zucchini, Gurke, Avocado und Frischkäse, umwickelt mit Lachs, Thunfisch, Butterfisch, Garnelen oder Aal|8 Stück
84|The Boss Roll|11|Frischkäse, Mango, Avocado, Lachs, Thunfisch und Rucola|8 Stück
`);

addBlock("Premium Rolls", 24, `
68|Scallop Passion|15|Avocado, Spargel, Jakobsmuscheln und Frischkäse, leicht scharf, umwickelt mit Garnelen|8 Stück
72|California Surimi Roll|10|Surimi, Frischkäse, Avocado, Gurken und Tobiko|8 Stück
72a|Onion Crush|11|Röstzwiebeln, Frischkäse, Thunfisch, Butterfisch und Avocado|8 Stück
73|Yakitori Fever|12|Gurken, Avocado, Frischkäse, Hähnchenspieße und Unagi Sauce|8 Stück
74c|Green Inferno|13|Panierter Lachs, Thunfisch oder Butterfisch mit Frischkäse und Spargel, mit Avocado umwickelt und Unagi Sauce|8 Stück
`);

addBlock("Premium Rolls", 25, `
74|Ebi Tempura Roll|12|Knusprige Garnelen und Avocado|8 Stück
74a|Yakinuki Ebi Tempura Roll|13|Knusprige Garnelen, Gurken und Frischkäse, umwickelt mit flambiertem Lachs, Thunfisch, Butterfisch, Garnelen oder Aal|8 Stück
74b|Green Temptation|13|Knusprige Garnelen, Gurken und Käse, mit Avocado umwickelt und Teriyaki|8 Stück
74d|Octopus Secret|15|Frischkäse, Avocado, Oktopus und Garnelen|8 Stück
77|Unagi Tempura|14|Knusprige Garnelen und Avocado, mit Aal umwickelt und Teriyaki|8 Stück
`);

addBlock("Premium Rolls", 26, `
77b|Flaming Dragon|15|Aal, Avocado, Unagi, Gurken und Spargel, umwickelt mit flambiertem Lachs, Thunfisch oder Butterfisch|8 Stück
82|Chérie Passion|13|Garnelen, Frischkäse, Avocado, Rucola und Gurke|8 Stück
82a|Ocean on Fire|15|Garnelen, Frischkäse, Avocado und Gurke, umwickelt mit flambiertem Lachs, Thunfisch, Butterfisch oder Aal|8 Stück
83|Crispy Paradise|13|Avocado, knusprige Garnelen und gekochte Garnelen|8 Stück
85|Secret Umami|10|Surimi, Avocado, Gurken, Frischkäse, Rucola und Garnelen|8 Stück
`);

addBlock("Premium Rolls", 27, `
78a|Yakiniku California|13|Surimi, Frischkäse, Mango, Gurken und Avocado, umwickelt mit flambiertem Lachs, Thunfisch, Butterfisch oder Aal|8 Stück
80|Belle Passion|10|Frischkäse, Rucola, Gurken und Lachs|8 Stück
81|Mon Chéri Gold|10|Surimi, Avocado, Gurken und Rucola, umwickelt mit Tofu und Frischkäse|8 Stück
86|Noir Desire|10|Avocado und knuspriger Surimi|8 Stück
89|French Kiss Deluxe|10|Surimi, Gurken, Avocado, Rucola, Frischkäse und Unagi Sauce|8 Stück
`);

addBlock("Frittiertes Sushi", 28, `
903|Poisson Mystère|13|Spargel, Lachs, Garnelen und Butterfisch|8 Stück
907|Saumon Maki|7|Lachs|8 Stück
908|Thon Maki|7|Thunfisch|8 Stück
909|Maki Poisson Beurre|7|Butterfisch|8 Stück
910|Saumon Belle Époque|11|Lachs, Avocado, Surimi, Frischkäse, Mayonnaise und Teriyaki|6 Stück
911|Rouge Milano|11|Thunfisch, Avocado, Surimi, Frischkäse, Mayonnaise und Teriyaki|6 Stück
912|Le Grand Crunch|13|Lachs, Avocado, Surimi, Frischkäse, Thunfisch, Garnelen, Mayonnaise und Teriyaki|6 Stück
913|Sapore Divino|11|Frischkäse, Avocado, Spargel, Surimi, Butterfisch und Teriyaki|6 Stück
`);

addBlock("Frittiertes Sushi", 29, `
914|Chicken Monte Carlo|13|Frischkäse, Avocado, Surimi und Hähnchen Teriyaki|6 Stück
915|Scallops Mirage|12|Jakobsmuscheln, Avocado, Spargel, Surimi, Frischkäse und Wasabi Sauce|6 Stück
916|Saumon Saint Tropez|12|Lachs, Avocado, Surimi, Garnelen, Frischkäse und Wasabi Sauce|6 Stück
917|Tuna Rendezvous|12|Garnelen, Avocado, Surimi, Thunfisch, Frischkäse und Mango Sauce|6 Stück
918|Duck à la Mode|13|Lachs, Ente, Avocado, Surimi, Garnelen, Frischkäse und Wasabi Sauce|6 Stück
919|Golden Parisien|13|Lachs, Ente, Spargel, Surimi, Frischkäse und Mango Sauce|6 Stück
920|Octopus Privé|13|Butterfisch, Oktopus, Avocado, Spargel, Frischkäse, Thunfisch und Mango Sauce|6 Stück
921|Umami Monaco|13|Kräuterseitling, Lachs, Spargel, Ente, Frischkäse, Thunfisch, Nigiri und Mango Sauce|6 Stück
`);

addBlock("Sushi Platten", 30, `
100|Maki Rendezvous|14|6 Sake Maki, 6 Avocado Tofu Maki und 6 Lachs Maki
102|Minalo Imperiale|29|8 California Roll, 8 gekochter Lachs Roll und 8 Ebi Tempura Roll
103|Saumon Dynasty|19|2 Sake Nigiri, 8 Salmon Roll und 6 Edo Maki
104|Maguro Privé|20|2 Maguro Nigiri, 6 Tekka Avocado Maki und 8 Tuna Roll
105|Grande Appetio|29|2 Inari, 2 Ebi Nigiri, 6 Avocado Maki, 6 Lachs Maki und 8 Ebi Tempura Roll
106|Notte di Lusso|45|4 Nigiri, 12 Maki, 8 Spargel Roll, 8 Ebi Tempura Roll und 5 Futo Maki
107|La Dolce Notte|65|8 Salmon Queen Roll, 5 Futo Maki, 12 Crunchy Roll, 8 Tuna Spargel Roll, 12 gemischte Maki und 3 Nigiri
`);

addBlock("Sushi Platten", 31, `
502|Vizio Italiano|25|8 Surimi Inari Roll, 8 Salmon Roll und 4 Sake Nigiri
504|Salmon L'Aventure|51|6 Edo Maki, 6 Sake Nigiri, 8 Surimi Inari Roll, 8 Salmon Roll, 5 Futo Maki und 6 Sashimi
505|Legend Reserve|42|4 Nigiri, 5 Futo Maki, 8 Inside Out Roll, 6 Crunchy Roll und 12 Maki
506|Crispy Enchanté|38|6 Crunchy Roll, 6 gekochter Salmon Maki, 6 Avocado Maki, 8 Ebi Tempura Roll und 4 Nigiri
511|Umami Nocturne|57|12 Crunchy Roll, 12 Maki, 16 Inside Out Roll und 5 Futo Maki
512|Osaka Délice|47|8 Salmon Spargel Roll, 8 Salmon Roll, 5 Futo Maki, 2 Ebi Nigiri, 2 Maguro Nigiri und 4 Sake Nigiri
513|Saumon de Kyoto|41|8 Salmon Queen Roll, 12 Maki, 8 Salmon Garnelen Roll, 3 Salmon Nigiri und 3 Tuna
`);

addBlock("Sushi Platten", 32, `
110|Ocean Delizia|41|8 Tuna Spargel Roll, 8 Sakana Mango Roll, 8 Surimi Inari Roll und 8 Salmon Queen Roll
111|Solo Délice|19|Empfehlung des Sushimeisters. Jede Bestellung wird unterschiedlich zusammengestellt.
112|Duo Delizioso|50|Empfehlung des Sushimeisters. Jede Bestellung wird unterschiedlich zusammengestellt, mit oder ohne Sashimi.
507|Fresh Élite|38|3 Sake Nigiri, 2 Ebi Nigiri, 3 Maguro Nigiri, 6 Avocado Maki, 8 Tuna Roll und 6 Edo Maki
508|Petit Péché|35|6 gekochter Salmon Maki, 6 Sashimi, 4 Nigiri, 8 California Roll und 8 Ebi Tempura Roll
509|Tokyo Soirée|37|16 Inside Out Roll, 6 Crunchy Roll und 5 Futo Maki
510|Bouchée Folle|39|6 Maki, 2 Nigiri, 6 Crunchy Roll, 8 Inside Out Roll und 5 Futo Maki
`);

addBlock("Sushi Platten", 33, `
514|Duo de la Mer|25|4 Salmon Nigiri, 2 Maguro, 6 Tekka Maki, 4 Salmon Roll und 4 California Roll
515|Salmon Banquet|19|6 Sake Nigiri, 4 Salmon Roll und 4 California Roll
516|Ocean Playboy|48|6 Crunchy Roll, 8 Salmon Roll, 8 California Aubergine Roll, 2 Maguro Nigiri, 2 Ebi Nigiri und 2 Salmon Nigiri
901|Golden Crave|35|8 Surimi Inari, 8 Ebi Tempura, 6 Avocado Maki, 6 Crunchy Roll und 2 Ebi Nigiri
`);

addBlock("Vegan & Vegetarisch", 34, `
615|Seetangsalat|6|Seaweed Salad
616|Zitronengrassuppe mit Tofu|6
617|Kokossuppe mit Tofu|6
618|Japanese Cheese Sticks|4|Frittiert
619|Aubergine Teriyaki|6
620|Vegetarische Frühlingsrollen|5||6 Stück
621|Yasai Tempura|6|Frittiertes Gemüse und Käse
622|Gyoza vegetarisch|6||4 Stück
`);

addBlock("Vegan & Vegetarisch", 35, `
623|Bún Trộn|15|Reisnudeln, Salat, Sauce, Tofu, Erdnuss, Röstzwiebeln und Koriander
624|Vegetarisch Hokkaido Curry|15|Frisches Gemüse und Reis mit Tofu
625|Udon Thai Curry|15|Udon Nudeln, Thai Curry Sauce, Gemüse und Tofu
626|Reisnudeln Erdnusssauce|15|Reisnudeln, Erdnusssauce, Salat und Tofu
627|Phở Salat Tofu|15|Bandnudeln, Salat, hausgemachte Sauce und Erdnuss
628|Phở Trộn vegetarisch|15|Reisbandnudeln, Salat, Sauce, Tofu, Erdnuss, Röstzwiebeln und Koriander
629|Mango Tofu Garden|15|Mango Sauce, Reis, Gemüse und Tofu
`);

addBlock("Vegan & Vegetarisch", 36, `
600|Spargel Maki|4|Spargel|6 Stück
601|Mango Maki|4|Mango|6 Stück
602|Mozzarella Maki|4|Mozzarella|6 Stück
603|Kräuterseitling Maki|4|Japanische Kräuterseitlinge|6 Stück
604|Frittierter Spargel Maki|4|Frittierter Spargel|6 Stück
605|Vegan Avocado Fry Maki|4|Frittierte Avocado|6 Stück
606|Vegan Avocado Maki|4|Avocado|6 Stück
607|Vegetarisch Kappa Maki|4|Gurken, Frischkäse und Sesam|6 Stück
608|Vegetarisch Tamago Maki|4|Ei und Sesam|6 Stück
609|Vegan Avocado Tofu Maki|4|Avocado und Tofu|6 Stück
610|Vegetarische Rucola Maki|4|Rucola und Frischkäse|6 Stück
611|Vegan Wakame Maki|4|Algensalat und Sesam|6 Stück
`);

addBlock("Vegan & Vegetarisch", 37, `
660|Knusprig Eier Maki|6|Knusprige Maki mit Ei|8 Stück
661|Knusprig Spargel Maki|6|Knusprige Maki mit Spargel|8 Stück
662|Knusprig Avocado Maki|6|Knusprige Maki mit Avocado|8 Stück
663|Vegan Crunchy Roll|12|Vegane Crunchy Roll|6 Stück
664|Vegetarisch Crunchy Roll|12|Vegetarische Crunchy Roll|6 Stück
690|Vegan Futo Maki|9|Avocado, Gurken, Rucola, Spargel und Tofu|5 Stück
691|Vegetarisch Futo Maki|9|Käse, Avocado, Gurken, Ei, Rucola und Spargel|5 Stück
692|Vegetarisch Futo Avocado Maki|9|Frischkäse, Avocado, Gurken, Ei, Rucola und japanische Kräuterseitlinge|5 Stück
693|Vegetarisch Futo Spargel|9|Frischkäse, Avocado, Gurken, Rucola, Spargel und Tofu|5 Stück
`);

addBlock("Spezial Rolls", 38, `
630|Mango Queen|10|Mango, Gurken, Frischkäse und Avocado|Vegan oder vegetarisch
631|Tofu Onion|10|Tofu, Frischkäse, rote Zwiebel, Spargel und Avocado|Vegan oder vegetarisch
632|Yasai Roll|11|Japanische Kräuterseitlinge, mit Avocado und Panko Butter umwickelt|Vegan oder vegetarisch
633|Geisha Roll|11|Panierte Zucchini, Frischkäse und Spargel, mit Avocado, Tofu und Süßkartoffel umwickelt|Vegan oder vegetarisch
634|Yasai Crazy|10|Kräuterseitlinge, Spargel, Gurken und Frischkäse, mit Avocado und Tofu umwickelt|Vegan oder vegetarisch
635|Mozzarella Lover Roll|10|Frischkäse, Gurken, Mozzarella und Avocado|Vegan oder vegetarisch
`);

addBlock("Spezial Rolls", 39, `
636|Panko Butter Bombe Roll|11|Käse, Panko Butter, Avocado, Spargel und Gurken|Vegan oder vegetarisch
637|Aubergine Bombe Roll|10|Knusprige Aubergine, Frischkäse, Gurken und Spargel|Vegan oder vegetarisch
638|Avocado Queen Roll|10|Frischkäse, Avocado, Gurken, Rucola, Tofu und Ei|Vegan oder vegetarisch
639|Spargel Roll|10|Frischkäse, Avocado, Gurken, Rucola, Tofu und Spargel|Vegan oder vegetarisch
640|Avocado Lover Roll|10|Knusprige Avocado, Frischkäse und Gurken|Vegan oder vegetarisch
641|Sweet Sakura Roll|11|Avocado, Spargel, Rucola, Frischkäse und Süßkartoffel|Vegan oder vegetarisch
642|Tamago Lucky Roll|10|Gurken, Avocado, Rucola und Frischkäse|Vegan oder vegetarisch
`);

addBlock("Vegan & Vegetarisch", 40, `
670|Zen Maki|13|18 Maki, vegan oder vegetarisch
671|Plant Paradise|35|16 Inside Out Roll, 12 Maki und 5 Futo Maki
672|Monte Carlo Végétal|19|16 Inside Out Roll und Seetangsalat
673|Osaka Végétal|49|16 Spezial Roll, 12 Maki und 12 Crunchy Roll
674|Green Heaven|29|Seetangsalat, 12 Maki, Crunchy Roll und 8 Spezial Roll
675|Buddha Green|29|24 Inside Out Roll und Seetangsalat
676|Tokyo Green Party|55|24 Spezial Roll, 5 Futo Maki, 18 gemischte Maki und Crunchy Roll
677|Kyoto Buddha|26|16 Inside Out Roll und Crunchy Roll
678|Buddha Yasai|27|12 Maki, 16 Inside Out Roll und Seetangsalat
679|Yasai Signature|43|Crunchy Roll, 12 Maki, 16 Spezial Roll und 5 Futo Maki
`);

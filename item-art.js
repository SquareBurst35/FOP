import { ADDITIONAL_ITEMS } from "./additional-items.js?v=24";
// Original pixel-art interpretations. Visual placement does not change game rules.
export const ORIGINAL_ITEM_ART = Object.freeze([
  {
    "id": "livro-base-armas-faca",
    "name": "Faca",
    "atlas": "assets/item-art/weapons-atlas-01.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 0,
    "sourceRect": [
      128,
      58,
      62,
      216
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5161290322580645,
      0.7731481481481481
    ],
    "widthOnDoll": 33.00925925925926,
    "bounds": [
      0.03225806451612903,
      0.009259259259259259,
      0.967741935483871,
      0.9907407407407407
    ],
    "angle": 0
  },
  {
    "id": "livro-base-armas-martelo",
    "name": "Martelo",
    "atlas": "assets/item-art/weapons-atlas-01.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 1,
    "sourceRect": [
      401,
      41,
      148,
      242
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.49324324324324326,
      0.7520661157024794
    ],
    "widthOnDoll": 94.79338842975207,
    "bounds": [
      0.013513513513513514,
      0.008264462809917356,
      0.9864864864864865,
      0.9917355371900827
    ],
    "angle": 0
  },
  {
    "id": "livro-base-armas-punhal",
    "name": "Punhal",
    "atlas": "assets/item-art/weapons-atlas-01.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 2,
    "sourceRect": [
      737,
      30,
      95,
      251
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.49473684210526314,
      0.8127490039840638
    ],
    "widthOnDoll": 49.20318725099602,
    "bounds": [
      0.021052631578947368,
      0.00796812749003984,
      0.9789473684210527,
      0.9920318725099602
    ],
    "angle": 0
  },
  {
    "id": "livro-base-armas-bastao",
    "name": "Bastão",
    "atlas": "assets/item-art/weapons-atlas-01.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 3,
    "sourceRect": [
      1061,
      24,
      72,
      272
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5138888888888888,
      0.7573529411764706
    ],
    "widthOnDoll": 63.529411764705884,
    "bounds": [
      0.027777777777777776,
      0.007352941176470588,
      0.9722222222222222,
      0.9926470588235294
    ],
    "angle": 0
  },
  {
    "id": "livro-base-armas-machete",
    "name": "Machete",
    "atlas": "assets/item-art/weapons-atlas-01.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 4,
    "sourceRect": [
      135,
      329,
      81,
      277
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.35802469135802467,
      0.8158844765342961
    ],
    "widthOnDoll": 52.63537906137184,
    "bounds": [
      0.024691358024691357,
      0.007220216606498195,
      0.9753086419753086,
      0.9927797833935018
    ],
    "angle": 0
  },
  {
    "id": "livro-base-armas-lanca",
    "name": "Lança",
    "atlas": "assets/item-art/weapons-atlas-01.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 5,
    "sourceRect": [
      444,
      321,
      54,
      294
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.4074074074074074,
      0.54421768707483
    ],
    "widthOnDoll": 66.12244897959184,
    "bounds": [
      0.037037037037037035,
      0.006802721088435374,
      0.9629629629629629,
      0.9931972789115646
    ],
    "angle": 0
  },
  {
    "id": "livro-base-armas-cajado",
    "name": "Cajado",
    "atlas": "assets/item-art/weapons-atlas-01.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 6,
    "sourceRect": [
      766,
      318,
      37,
      297
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.4864864864864865,
      0.531986531986532
    ],
    "widthOnDoll": 45.47138047138047,
    "bounds": [
      0.05405405405405406,
      0.006734006734006734,
      0.9459459459459459,
      0.9932659932659933
    ],
    "angle": 0
  },
  {
    "id": "livro-base-armas-arco",
    "name": "Arco",
    "atlas": "assets/item-art/weapons-atlas-01.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 7,
    "sourceRect": [
      1051,
      321,
      79,
      294
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.25316455696202533,
      0.5068027210884354
    ],
    "widthOnDoll": 76.58163265306122,
    "bounds": [
      0.02531645569620253,
      0.006802721088435374,
      0.9746835443037974,
      0.9931972789115646
    ],
    "angle": 0
  },
  {
    "id": "livro-base-armas-besta",
    "name": "Besta",
    "atlas": "assets/item-art/weapons-atlas-01.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 8,
    "sourceRect": [
      48,
      663,
      241,
      228
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.36929460580912865,
      0.6491228070175439
    ],
    "widthOnDoll": 216.68859649122808,
    "bounds": [
      0.008298755186721992,
      0.008771929824561403,
      0.991701244813278,
      0.9912280701754386
    ],
    "angle": -40
  },
  {
    "id": "livro-base-armas-pistola",
    "name": "Pistola",
    "atlas": "assets/item-art/weapons-atlas-01.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 9,
    "sourceRect": [
      372,
      667,
      211,
      213
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.23222748815165878,
      0.7230046948356808
    ],
    "widthOnDoll": 123.82629107981221,
    "bounds": [
      0.009478672985781991,
      0.009389671361502348,
      0.990521327014218,
      0.9906103286384976
    ],
    "angle": -15
  },
  {
    "id": "livro-base-armas-revolver",
    "name": "Revólver",
    "atlas": "assets/item-art/weapons-atlas-01.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 10,
    "sourceRect": [
      675,
      656,
      228,
      229
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.21929824561403508,
      0.7379912663755459
    ],
    "widthOnDoll": 124.45414847161572,
    "bounds": [
      0.008771929824561403,
      0.008733624454148471,
      0.9912280701754386,
      0.9912663755458515
    ],
    "angle": -15
  },
  {
    "id": "livro-base-armas-fuzil-de-caca",
    "name": "Fuzil de caça",
    "atlas": "assets/item-art/weapons-atlas-01.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 11,
    "sourceRect": [
      963,
      646,
      260,
      245
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.35,
      0.6571428571428571
    ],
    "widthOnDoll": 318.3673469387755,
    "bounds": [
      0.007692307692307693,
      0.00816326530612245,
      0.9923076923076923,
      0.9918367346938776
    ],
    "angle": -40
  },
  {
    "id": "livro-base-armas-machadinha",
    "name": "Machadinha",
    "atlas": "assets/item-art/weapons-atlas-01.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 12,
    "sourceRect": [
      110,
      952,
      126,
      247
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.25396825396825395,
      0.708502024291498
    ],
    "widthOnDoll": 86.72064777327935,
    "bounds": [
      0.015873015873015872,
      0.008097165991902834,
      0.9841269841269841,
      0.9919028340080972
    ],
    "angle": 0
  },
  {
    "id": "livro-base-armas-nunchaku",
    "name": "Nunchaku",
    "atlas": "assets/item-art/weapons-atlas-01.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 13,
    "sourceRect": [
      407,
      949,
      174,
      250
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.16091954022988506,
      0.704
    ],
    "widthOnDoll": 139.2,
    "bounds": [
      0.011494252873563218,
      0.008,
      0.9885057471264368,
      0.992
    ],
    "angle": 0
  },
  {
    "id": "livro-base-armas-corrente",
    "name": "Corrente",
    "atlas": "assets/item-art/weapons-atlas-01.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 14,
    "sourceRect": [
      699,
      956,
      171,
      233
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5087719298245614,
      0.10300429184549356
    ],
    "widthOnDoll": 132.10300429184548,
    "bounds": [
      0.011695906432748537,
      0.008583690987124463,
      0.9883040935672515,
      0.9914163090128756
    ],
    "angle": 0
  },
  {
    "id": "livro-base-armas-espada",
    "name": "Espada",
    "atlas": "assets/item-art/weapons-atlas-01.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 15,
    "sourceRect": [
      1036,
      904,
      122,
      321
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.48360655737704916,
      0.8255451713395638
    ],
    "widthOnDoll": 110.21806853582555,
    "bounds": [
      0.01639344262295082,
      0.006230529595015576,
      0.9836065573770492,
      0.9937694704049844
    ],
    "angle": 0
  },
  {
    "id": "livro-base-armas-florete",
    "name": "Florete",
    "atlas": "assets/item-art/weapons-atlas-02.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 0,
    "sourceRect": [
      126,
      20,
      69,
      275
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.4782608695652174,
      0.8836363636363637
    ],
    "widthOnDoll": 69.0,
    "bounds": [
      0.028985507246376812,
      0.007272727272727273,
      0.9710144927536232,
      0.9927272727272727
    ],
    "angle": 0
  },
  {
    "id": "livro-base-armas-machado",
    "name": "Machado",
    "atlas": "assets/item-art/weapons-atlas-02.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 1,
    "sourceRect": [
      432,
      25,
      113,
      266
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.23008849557522124,
      0.8045112781954887
    ],
    "widthOnDoll": 121.07142857142857,
    "bounds": [
      0.017699115044247787,
      0.007518796992481203,
      0.9823008849557522,
      0.9924812030075187
    ],
    "angle": 0
  },
  {
    "id": "livro-base-armas-marreta",
    "name": "Marreta",
    "atlas": "assets/item-art/weapons-atlas-02.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 2,
    "sourceRect": [
      717,
      25,
      135,
      261
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.4962962962962963,
      0.7011494252873564
    ],
    "widthOnDoll": 142.24137931034483,
    "bounds": [
      0.014814814814814815,
      0.007662835249042145,
      0.9851851851851852,
      0.9923371647509579
    ],
    "angle": 0
  },
  {
    "id": "livro-base-armas-acha",
    "name": "Acha",
    "atlas": "assets/item-art/weapons-atlas-02.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 3,
    "sourceRect": [
      1015,
      16,
      165,
      279
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.4909090909090909,
      0.7670250896057348
    ],
    "widthOnDoll": 186.29032258064515,
    "bounds": [
      0.012121212121212121,
      0.007168458781362007,
      0.9878787878787879,
      0.992831541218638
    ],
    "angle": 0
  },
  {
    "id": "livro-base-armas-gadanho",
    "name": "Gadanho",
    "atlas": "assets/item-art/weapons-atlas-02.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 4,
    "sourceRect": [
      47,
      329,
      182,
      282
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.9010989010989011,
      0.6063829787234043
    ],
    "widthOnDoll": 225.88652482269504,
    "bounds": [
      0.01098901098901099,
      0.0070921985815602835,
      0.989010989010989,
      0.9929078014184397
    ],
    "angle": 0
  },
  {
    "id": "livro-base-armas-katana",
    "name": "Katana",
    "atlas": "assets/item-art/weapons-atlas-02.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 5,
    "sourceRect": [
      440,
      329,
      57,
      282
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.42105263157894735,
      0.8475177304964538
    ],
    "widthOnDoll": 58.61702127659574,
    "bounds": [
      0.03508771929824561,
      0.0070921985815602835,
      0.9649122807017544,
      0.9929078014184397
    ],
    "angle": 0
  },
  {
    "id": "livro-base-armas-montante",
    "name": "Montante",
    "atlas": "assets/item-art/weapons-atlas-02.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 6,
    "sourceRect": [
      721,
      319,
      126,
      294
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5,
      0.8537414965986394
    ],
    "widthOnDoll": 145.71428571428572,
    "bounds": [
      0.015873015873015872,
      0.006802721088435374,
      0.9841269841269841,
      0.9931972789115646
    ],
    "angle": 0
  },
  {
    "id": "livro-base-armas-moto-serra",
    "name": "Moto-serra",
    "atlas": "assets/item-art/weapons-atlas-02.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 7,
    "sourceRect": [
      1032,
      319,
      126,
      292
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5793650793650794,
      0.7945205479452054
    ],
    "widthOnDoll": 112.1917808219178,
    "bounds": [
      0.015873015873015872,
      0.00684931506849315,
      0.9841269841269841,
      0.9931506849315068
    ],
    "angle": 0
  },
  {
    "id": "livro-base-armas-arco-composto",
    "name": "Arco composto",
    "atlas": "assets/item-art/weapons-atlas-02.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 8,
    "sourceRect": [
      116,
      630,
      99,
      285
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.41414141414141414,
      0.5368421052631579
    ],
    "widthOnDoll": 104.21052631578948,
    "bounds": [
      0.020202020202020204,
      0.007017543859649123,
      0.9797979797979798,
      0.9929824561403509
    ],
    "angle": 0
  },
  {
    "id": "livro-base-armas-balestra",
    "name": "Balestra",
    "atlas": "assets/item-art/weapons-atlas-02.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 9,
    "sourceRect": [
      348,
      654,
      263,
      247
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.38022813688212925,
      0.6356275303643725
    ],
    "widthOnDoll": 287.4898785425101,
    "bounds": [
      0.0076045627376425855,
      0.008097165991902834,
      0.9923954372623575,
      0.9919028340080972
    ],
    "angle": -40
  },
  {
    "id": "livro-base-armas-submetralhadora",
    "name": "Submetralhadora",
    "atlas": "assets/item-art/weapons-atlas-02.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 10,
    "sourceRect": [
      675,
      667,
      236,
      215
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.2796610169491525,
      0.7534883720930232
    ],
    "widthOnDoll": 230.51162790697674,
    "bounds": [
      0.00847457627118644,
      0.009302325581395349,
      0.9915254237288136,
      0.9906976744186047
    ],
    "angle": -40
  },
  {
    "id": "livro-base-armas-espingarda",
    "name": "Espingarda",
    "atlas": "assets/item-art/weapons-atlas-02.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 11,
    "sourceRect": [
      960,
      659,
      266,
      226
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.3533834586466165,
      0.6415929203539823
    ],
    "widthOnDoll": 347.21238938053096,
    "bounds": [
      0.007518796992481203,
      0.008849557522123894,
      0.9924812030075187,
      0.9911504424778761
    ],
    "angle": -40
  },
  {
    "id": "livro-base-armas-fuzil-de-assalto",
    "name": "Fuzil de assalto",
    "atlas": "assets/item-art/weapons-atlas-02.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 12,
    "sourceRect": [
      33,
      955,
      277,
      240
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.4007220216606498,
      0.7291666666666666
    ],
    "widthOnDoll": 323.1666666666667,
    "bounds": [
      0.007220216606498195,
      0.008333333333333333,
      0.9927797833935018,
      0.9916666666666667
    ],
    "angle": -40
  },
  {
    "id": "livro-base-armas-fuzil-de-precisao",
    "name": "Fuzil de precisão",
    "atlas": "assets/item-art/weapons-atlas-02.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 13,
    "sourceRect": [
      331,
      955,
      285,
      248
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.3684210526315789,
      0.6774193548387096
    ],
    "widthOnDoll": 379.23387096774195,
    "bounds": [
      0.007017543859649123,
      0.008064516129032258,
      0.9929824561403509,
      0.9919354838709677
    ],
    "angle": -40
  },
  {
    "id": "livro-base-armas-bazuca",
    "name": "Bazuca",
    "atlas": "assets/item-art/weapons-atlas-02.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 14,
    "sourceRect": [
      643,
      955,
      288,
      229
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.3263888888888889,
      0.8646288209606987
    ],
    "widthOnDoll": 358.4279475982533,
    "bounds": [
      0.006944444444444444,
      0.008733624454148471,
      0.9930555555555556,
      0.9912663755458515
    ],
    "angle": -40
  },
  {
    "id": "livro-base-armas-lanca-chamas",
    "name": "Lança-chamas",
    "atlas": "assets/item-art/weapons-atlas-02.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 15,
    "sourceRect": [
      960,
      965,
      271,
      224
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.4981549815498155,
      0.6785714285714286
    ],
    "widthOnDoll": 314.55357142857144,
    "bounds": [
      0.007380073800738007,
      0.008928571428571428,
      0.992619926199262,
      0.9910714285714286
    ],
    "angle": -40
  },
  {
    "id": "livro-base-armas-metralhadora",
    "name": "Metralhadora",
    "atlas": "assets/item-art/weapons-atlas-03.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 0,
    "sourceRect": [
      22,
      48,
      301,
      258
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.3388704318936877,
      0.7751937984496124
    ],
    "widthOnDoll": 361.6666666666667,
    "bounds": [
      0.006644518272425249,
      0.007751937984496124,
      0.9933554817275747,
      0.9922480620155039
    ],
    "angle": -40
  },
  {
    "id": "sobrevivendo-ao-horror-armas-pregador-pneumatico",
    "name": "Pregador pneumático",
    "atlas": "assets/item-art/weapons-atlas-03.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 1,
    "sourceRect": [
      381,
      61,
      221,
      235
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.167420814479638,
      0.7148936170212766
    ],
    "widthOnDoll": 141.06382978723406,
    "bounds": [
      0.00904977375565611,
      0.00851063829787234,
      0.9909502262443439,
      0.9914893617021276
    ],
    "angle": -15
  },
  {
    "id": "sobrevivendo-ao-horror-armas-estilingue",
    "name": "Estilingue",
    "atlas": "assets/item-art/weapons-atlas-03.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 2,
    "sourceRect": [
      697,
      54,
      174,
      252
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5,
      0.8134920634920635
    ],
    "widthOnDoll": 89.76190476190476,
    "bounds": [
      0.011494252873563218,
      0.007936507936507936,
      0.9885057471264368,
      0.9920634920634921
    ],
    "angle": 0
  },
  {
    "id": "sobrevivendo-ao-horror-armas-revolver-compacto",
    "name": "Revólver compacto",
    "atlas": "assets/item-art/weapons-atlas-03.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 3,
    "sourceRect": [
      998,
      83,
      193,
      213
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.21243523316062177,
      0.7981220657276995
    ],
    "widthOnDoll": 108.73239436619718,
    "bounds": [
      0.010362694300518135,
      0.009389671361502348,
      0.9896373056994818,
      0.9906103286384976
    ],
    "angle": -15
  },
  {
    "id": "sobrevivendo-ao-horror-armas-baioneta",
    "name": "Baioneta",
    "atlas": "assets/item-art/weapons-atlas-03.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 4,
    "sourceRect": [
      113,
      337,
      122,
      277
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.39344262295081966,
      0.8122743682310469
    ],
    "widthOnDoll": 70.46931407942239,
    "bounds": [
      0.01639344262295082,
      0.007220216606498195,
      0.9836065573770492,
      0.9927797833935018
    ],
    "angle": 0
  },
  {
    "id": "sobrevivendo-ao-horror-armas-faca-tatica",
    "name": "Faca tática",
    "atlas": "assets/item-art/weapons-atlas-03.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 5,
    "sourceRect": [
      426,
      337,
      95,
      278
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.49473684210526314,
      0.8057553956834532
    ],
    "widthOnDoll": 49.55035971223022,
    "bounds": [
      0.021052631578947368,
      0.007194244604316547,
      0.9789473684210527,
      0.9928057553956835
    ],
    "angle": 0
  },
  {
    "id": "sobrevivendo-ao-horror-armas-gancho-de-carne",
    "name": "Gancho de carne",
    "atlas": "assets/item-art/weapons-atlas-03.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 6,
    "sourceRect": [
      687,
      350,
      188,
      260
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5159574468085106,
      0.11153846153846154
    ],
    "widthOnDoll": 108.46153846153847,
    "bounds": [
      0.010638297872340425,
      0.007692307692307693,
      0.9893617021276596,
      0.9923076923076923
    ],
    "angle": 0
  },
  {
    "id": "sobrevivendo-ao-horror-armas-bastao-policial",
    "name": "Bastão policial",
    "atlas": "assets/item-art/weapons-atlas-03.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 7,
    "sourceRect": [
      1052,
      333,
      138,
      281
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.2391304347826087,
      0.800711743772242
    ],
    "widthOnDoll": 122.77580071174377,
    "bounds": [
      0.014492753623188406,
      0.0071174377224199285,
      0.9855072463768116,
      0.9928825622775801
    ],
    "angle": 0
  },
  {
    "id": "sobrevivendo-ao-horror-armas-picareta",
    "name": "Picareta",
    "atlas": "assets/item-art/weapons-atlas-03.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 8,
    "sourceRect": [
      38,
      640,
      258,
      280
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.49612403100775193,
      0.7035714285714286
    ],
    "widthOnDoll": 294.85714285714283,
    "bounds": [
      0.007751937984496124,
      0.007142857142857143,
      0.9922480620155039,
      0.9928571428571429
    ],
    "angle": 0
  },
  {
    "id": "sobrevivendo-ao-horror-armas-shuriken",
    "name": "Shuriken",
    "atlas": "assets/item-art/weapons-atlas-03.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 9,
    "sourceRect": [
      374,
      681,
      196,
      193
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5051020408163265,
      0.5129533678756477
    ],
    "widthOnDoll": 76.16580310880829,
    "bounds": [
      0.01020408163265306,
      0.010362694300518135,
      0.9897959183673469,
      0.9896373056994818
    ],
    "angle": 0
  },
  {
    "id": "sobrevivendo-ao-horror-armas-pistola-pesada",
    "name": "Pistola pesada",
    "atlas": "assets/item-art/weapons-atlas-03.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 10,
    "sourceRect": [
      649,
      659,
      265,
      251
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.21132075471698114,
      0.7211155378486056
    ],
    "widthOnDoll": 153.08764940239044,
    "bounds": [
      0.007547169811320755,
      0.00796812749003984,
      0.9924528301886792,
      0.9920318725099602
    ],
    "angle": -15
  },
  {
    "id": "sobrevivendo-ao-horror-armas-espingarda-de-cano-duplo",
    "name": "Espingarda de cano duplo",
    "atlas": "assets/item-art/weapons-atlas-03.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 11,
    "sourceRect": [
      949,
      653,
      288,
      261
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.3576388888888889,
      0.6360153256704981
    ],
    "widthOnDoll": 308.9655172413793,
    "bounds": [
      0.006944444444444444,
      0.007662835249042145,
      0.9930555555555556,
      0.9923371647509579
    ],
    "angle": -40
  },
  {
    "id": "livro-base-municoes-flechas",
    "name": "Flechas",
    "atlas": "assets/item-art/field-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 0,
    "sourceRect": [
      38,
      55,
      220,
      230
    ],
    "attachment": "ammo",
    "slot": "ammo",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 85,
    "bounds": [
      0.01818181818181818,
      0.017391304347826087,
      0.9863636363636363,
      0.9869565217391304
    ]
  },
  {
    "id": "livro-base-municoes-balas-leves",
    "name": "Balas leves",
    "atlas": "assets/item-art/field-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 1,
    "sourceRect": [
      371,
      80,
      210,
      214
    ],
    "attachment": "ammo",
    "slot": "ammo",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 66,
    "bounds": [
      0.014285714285714285,
      0.018691588785046728,
      0.9857142857142858,
      0.985981308411215
    ]
  },
  {
    "id": "livro-base-municoes-balas-pesadas",
    "name": "Balas pesadas",
    "atlas": "assets/item-art/field-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 2,
    "sourceRect": [
      676,
      23,
      226,
      270
    ],
    "attachment": "ammo",
    "slot": "ammo",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 76,
    "bounds": [
      0.017699115044247787,
      0.011111111111111112,
      0.9867256637168141,
      0.9888888888888889
    ]
  },
  {
    "id": "livro-base-municoes-cartuchos",
    "name": "Cartuchos",
    "atlas": "assets/item-art/field-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 3,
    "sourceRect": [
      999,
      99,
      214,
      188
    ],
    "attachment": "ammo",
    "slot": "ammo",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 55,
    "bounds": [
      0.014018691588785047,
      0.015957446808510637,
      0.985981308411215,
      0.9840425531914894
    ]
  },
  {
    "id": "livro-base-municoes-foguete",
    "name": "Foguete",
    "atlas": "assets/item-art/field-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 4,
    "sourceRect": [
      38,
      360,
      230,
      240
    ],
    "attachment": "ammo",
    "slot": "ammo",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 74,
    "bounds": [
      0.017391304347826087,
      0.0125,
      0.991304347826087,
      0.9875
    ]
  },
  {
    "id": "livro-base-municoes-combustivel",
    "name": "Combustível",
    "atlas": "assets/item-art/field-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 5,
    "sourceRect": [
      368,
      352,
      204,
      253
    ],
    "attachment": "ammo",
    "slot": "ammo",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 65,
    "bounds": [
      0.014705882352941176,
      0.011857707509881422,
      0.9852941176470589,
      0.9841897233201581
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-municoes-balas-curtas",
    "name": "Balas curtas",
    "atlas": "assets/item-art/field-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 6,
    "sourceRect": [
      683,
      405,
      207,
      193
    ],
    "attachment": "ammo",
    "slot": "ammo",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 57,
    "bounds": [
      0.014492753623188406,
      0.015544041450777202,
      0.9855072463768116,
      0.9844559585492227
    ]
  },
  {
    "id": "livro-base-protecoes-protecao-leve",
    "name": "Proteção leve",
    "atlas": "assets/item-art/field-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 7,
    "sourceRect": [
      984,
      374,
      237,
      229
    ],
    "attachment": "torso",
    "slot": "armor",
    "anchor": [
      0.5,
      0.43
    ],
    "widthOnDoll": 174,
    "bounds": [
      0.012658227848101266,
      0.013100436681222707,
      0.9957805907172996,
      0.982532751091703
    ]
  },
  {
    "id": "livro-base-protecoes-protecao-pesada",
    "name": "Proteção pesada",
    "atlas": "assets/item-art/field-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 8,
    "sourceRect": [
      26,
      656,
      265,
      253
    ],
    "attachment": "torso",
    "slot": "armor",
    "anchor": [
      0.5,
      0.43
    ],
    "widthOnDoll": 197,
    "bounds": [
      0.011320754716981131,
      0.011857707509881422,
      0.9886792452830189,
      0.9881422924901185
    ]
  },
  {
    "id": "livro-base-acessorios-kit-de-pericia",
    "name": "Kit de perícia",
    "atlas": "assets/item-art/field-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 9,
    "sourceRect": [
      335,
      691,
      287,
      204
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 72,
    "bounds": [
      0.010452961672473868,
      0.014705882352941176,
      0.9930313588850174,
      0.9852941176470589
    ]
  },
  {
    "id": "livro-base-acessorios-utensilio",
    "name": "Utensílio",
    "atlas": "assets/item-art/field-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 10,
    "sourceRect": [
      676,
      678,
      218,
      222
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.27,
      0.76
    ],
    "widthOnDoll": 74,
    "bounds": [
      0.01834862385321101,
      0.013513513513513514,
      0.9862385321100917,
      0.9864864864864865
    ]
  },
  {
    "id": "livro-base-acessorios-vestimenta",
    "name": "Vestimenta",
    "atlas": "assets/item-art/field-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 11,
    "sourceRect": [
      962,
      678,
      276,
      227
    ],
    "attachment": "torso",
    "slot": "outfit",
    "anchor": [
      0.5,
      0.43
    ],
    "widthOnDoll": 190,
    "bounds": [
      0.010869565217391304,
      0.013215859030837005,
      0.9927536231884058,
      0.986784140969163
    ]
  },
  {
    "id": "livro-base-explosivos-granada-de-atordoamento",
    "name": "Granada de atordoamento",
    "atlas": "assets/item-art/field-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 12,
    "sourceRect": [
      79,
      969,
      167,
      227
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 43,
    "bounds": [
      0.023952095808383235,
      0.013215859030837005,
      0.9820359281437125,
      0.9823788546255506
    ]
  },
  {
    "id": "livro-base-explosivos-granada-de-fragmentacao",
    "name": "Granada de fragmentação",
    "atlas": "assets/item-art/field-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 13,
    "sourceRect": [
      390,
      969,
      178,
      227
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 44,
    "bounds": [
      0.011235955056179775,
      0.013215859030837005,
      0.9775280898876404,
      0.9823788546255506
    ]
  },
  {
    "id": "livro-base-explosivos-granada-de-fumaca",
    "name": "Granada de fumaça",
    "atlas": "assets/item-art/field-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 14,
    "sourceRect": [
      711,
      965,
      157,
      234
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 42,
    "bounds": [
      0.025477707006369428,
      0.01282051282051282,
      0.9808917197452229,
      0.9871794871794872
    ]
  },
  {
    "id": "livro-base-explosivos-granada-incendiaria",
    "name": "Granada incendiária",
    "atlas": "assets/item-art/field-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 15,
    "sourceRect": [
      1040,
      965,
      157,
      234
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 42,
    "bounds": [
      0.01910828025477707,
      0.01282051282051282,
      0.9808917197452229,
      0.9871794871794872
    ]
  },
  {
    "id": "livro-base-explosivos-mina-antipessoal",
    "name": "Mina antipessoal",
    "atlas": "assets/item-art/field-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 0,
    "sourceRect": [
      70,
      116,
      202,
      164
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 68,
    "bounds": [
      0.019801980198019802,
      0.018292682926829267,
      0.9851485148514851,
      0.9817073170731707
    ]
  },
  {
    "id": "livro-base-operacionais-algemas",
    "name": "Algemas",
    "atlas": "assets/item-art/field-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 1,
    "sourceRect": [
      341,
      91,
      273,
      202
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 65,
    "bounds": [
      0.01098901098901099,
      0.019801980198019802,
      0.989010989010989,
      0.9851485148514851
    ]
  },
  {
    "id": "livro-base-operacionais-bandoleira",
    "name": "Bandoleira",
    "atlas": "assets/item-art/field-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 2,
    "sourceRect": [
      674,
      56,
      242,
      255
    ],
    "attachment": "torso",
    "slot": "outfit",
    "anchor": [
      0.5,
      0.4
    ],
    "widthOnDoll": 162,
    "bounds": [
      0.012396694214876033,
      0.011764705882352941,
      0.987603305785124,
      0.9882352941176471
    ],
    "z": 35
  },
  {
    "id": "livro-base-operacionais-cicatrizante",
    "name": "Cicatrizante",
    "atlas": "assets/item-art/field-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 3,
    "sourceRect": [
      1055,
      61,
      112,
      235
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 37,
    "bounds": [
      0.03571428571428571,
      0.01702127659574468,
      0.9642857142857143,
      0.9872340425531915
    ]
  },
  {
    "id": "livro-base-operacionais-lanterna",
    "name": "Lanterna",
    "atlas": "assets/item-art/field-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 4,
    "sourceRect": [
      51,
      362,
      229,
      224
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.69,
      0.72
    ],
    "widthOnDoll": 72,
    "bounds": [
      0.013100436681222707,
      0.013392857142857142,
      0.9868995633187773,
      0.9866071428571429
    ]
  },
  {
    "id": "livro-base-operacionais-oculos-de-visao-termica",
    "name": "Óculos de visão térmica",
    "atlas": "assets/item-art/field-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 5,
    "sourceRect": [
      328,
      409,
      286,
      132
    ],
    "attachment": "eyes",
    "slot": "head",
    "anchor": [
      0.5,
      0.5
    ],
    "widthOnDoll": 127,
    "bounds": [
      0.01048951048951049,
      0.022727272727272728,
      0.9895104895104895,
      0.9696969696969697
    ]
  },
  {
    "id": "livro-base-operacionais-pistola-de-dardos",
    "name": "Pistola de dardos",
    "atlas": "assets/item-art/field-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 6,
    "sourceRect": [
      645,
      379,
      278,
      202
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.77,
      0.78
    ],
    "widthOnDoll": 108,
    "bounds": [
      0.014388489208633094,
      0.01485148514851485,
      0.9892086330935251,
      0.9851485148514851
    ]
  },
  {
    "id": "livro-base-operacionais-soqueira",
    "name": "Soqueira",
    "atlas": "assets/item-art/field-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 7,
    "sourceRect": [
      980,
      407,
      251,
      171
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5,
      0.52
    ],
    "widthOnDoll": 57,
    "bounds": [
      0.01195219123505976,
      0.017543859649122806,
      0.9880478087649402,
      0.9824561403508771
    ]
  },
  {
    "id": "livro-base-operacionais-spray-de-pimenta",
    "name": "Spray de pimenta",
    "atlas": "assets/item-art/field-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 8,
    "sourceRect": [
      115,
      648,
      112,
      234
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 34,
    "bounds": [
      0.026785714285714284,
      0.01282051282051282,
      0.9732142857142857,
      0.9871794871794872
    ]
  },
  {
    "id": "livro-base-operacionais-taser",
    "name": "Taser",
    "atlas": "assets/item-art/field-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 9,
    "sourceRect": [
      404,
      643,
      133,
      244
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5,
      0.68
    ],
    "widthOnDoll": 49,
    "bounds": [
      0.022556390977443608,
      0.012295081967213115,
      0.9699248120300752,
      0.9877049180327869
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-acessorios-amuleto-sagrado",
    "name": "Amuleto sagrado",
    "atlas": "assets/item-art/field-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 10,
    "sourceRect": [
      704,
      632,
      167,
      250
    ],
    "attachment": "neck",
    "slot": "neck",
    "anchor": [
      0.5,
      0.1
    ],
    "widthOnDoll": 64,
    "bounds": [
      0.023952095808383235,
      0.012,
      0.9820359281437125,
      0.988
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-acessorios-celular",
    "name": "Celular",
    "atlas": "assets/item-art/field-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 11,
    "sourceRect": [
      1029,
      648,
      145,
      240
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5,
      0.7
    ],
    "widthOnDoll": 50,
    "bounds": [
      0.020689655172413793,
      0.016666666666666666,
      0.9793103448275862,
      0.9875
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-acessorios-chave-de-fenda-universal",
    "name": "Chave de fenda universal",
    "atlas": "assets/item-art/field-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 12,
    "sourceRect": [
      43,
      954,
      245,
      243
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.25,
      0.77
    ],
    "widthOnDoll": 61,
    "bounds": [
      0.012244897959183673,
      0.01646090534979424,
      0.9877551020408163,
      0.9835390946502057
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-acessorios-chaves",
    "name": "Chaves",
    "atlas": "assets/item-art/field-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 13,
    "sourceRect": [
      363,
      939,
      233,
      256
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 42,
    "bounds": [
      0.008583690987124463,
      0.01171875,
      0.9871244635193133,
      0.98828125
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-acessorios-documentos-falsos",
    "name": "Documentos falsos",
    "atlas": "assets/item-art/field-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 14,
    "sourceRect": [
      678,
      933,
      223,
      257
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 61,
    "bounds": [
      0.008968609865470852,
      0.011673151750972763,
      0.9865470852017937,
      0.9883268482490273
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-acessorios-manual-operacional",
    "name": "Manual operacional",
    "atlas": "assets/item-art/field-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 15,
    "sourceRect": [
      997,
      945,
      233,
      245
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 64,
    "bounds": [
      0.012875536480686695,
      0.012244897959183673,
      0.9871244635193133,
      0.9836734693877551
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-acessorios-notebook",
    "name": "Notebook",
    "atlas": "assets/item-art/field-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 0,
    "sourceRect": [
      21,
      51,
      265,
      262
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.51,
      0.72
    ],
    "widthOnDoll": 103,
    "bounds": [
      0.011320754716981131,
      0.003816793893129771,
      0.9886792452830189,
      0.9885496183206107
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-explosivos-dinamite",
    "name": "Dinamite",
    "atlas": "assets/item-art/field-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 1,
    "sourceRect": [
      351,
      77,
      243,
      227
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 62,
    "bounds": [
      0.012345679012345678,
      0.013215859030837005,
      0.9917695473251029,
      0.986784140969163
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-explosivos-explosivo-plastico",
    "name": "Explosivo plástico",
    "atlas": "assets/item-art/field-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 2,
    "sourceRect": [
      640,
      76,
      283,
      228
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 68,
    "bounds": [
      0.01060070671378092,
      0.017543859649122806,
      0.9893992932862191,
      0.9868421052631579
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-explosivos-galao-vermelho",
    "name": "Galão vermelho",
    "atlas": "assets/item-art/field-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 3,
    "sourceRect": [
      996,
      61,
      213,
      249
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5,
      0.14
    ],
    "widthOnDoll": 70,
    "bounds": [
      0.014084507042253521,
      0.012048192771084338,
      0.9812206572769953,
      0.9879518072289156
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-explosivos-granada-de-gas-sonifero",
    "name": "Granada de gás sonífero",
    "atlas": "assets/item-art/field-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 4,
    "sourceRect": [
      61,
      351,
      184,
      253
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 44,
    "bounds": [
      0.016304347826086956,
      0.011857707509881422,
      0.9836956521739131,
      0.9881422924901185
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-explosivos-granada-de-pem",
    "name": "Granada de PEM",
    "atlas": "assets/item-art/field-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 5,
    "sourceRect": [
      378,
      351,
      187,
      253
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 45,
    "bounds": [
      0.016042780748663103,
      0.011857707509881422,
      0.9786096256684492,
      0.9881422924901185
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-operacionais-alarme-de-movimento",
    "name": "Alarme de movimento",
    "atlas": "assets/item-art/field-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 6,
    "sourceRect": [
      702,
      336,
      166,
      277
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 52,
    "bounds": [
      0.018072289156626505,
      0.010830324909747292,
      0.9819277108433735,
      0.9891696750902527
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-operacionais-alimento-energetico",
    "name": "Alimento energético",
    "atlas": "assets/item-art/field-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 7,
    "sourceRect": [
      984,
      350,
      231,
      271
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 49,
    "bounds": [
      0.012987012987012988,
      0.01107011070110701,
      0.9826839826839827,
      0.988929889298893
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-operacionais-aplicador-de-medicamentos",
    "name": "Aplicador de medicamentos",
    "atlas": "assets/item-art/field-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 8,
    "sourceRect": [
      40,
      681,
      245,
      212
    ],
    "attachment": "wrist",
    "slot": "arms",
    "anchor": [
      0.5,
      0.5
    ],
    "widthOnDoll": 69,
    "bounds": [
      0.012244897959183673,
      0.014150943396226415,
      0.9877551020408163,
      0.9858490566037735
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-operacionais-bracadeira-reforcada",
    "name": "Braçadeira reforçada",
    "atlas": "assets/item-art/field-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 9,
    "sourceRect": [
      362,
      663,
      235,
      240
    ],
    "attachment": "wrist",
    "slot": "arms",
    "anchor": [
      0.5,
      0.5
    ],
    "widthOnDoll": 58,
    "bounds": [
      0.01276595744680851,
      0.0125,
      0.9872340425531915,
      0.9875
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-operacionais-cao-adestrado",
    "name": "Cão adestrado",
    "atlas": "assets/item-art/field-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 10,
    "sourceRect": [
      673,
      625,
      245,
      301
    ],
    "attachment": "companion",
    "slot": "companion",
    "anchor": [
      0.5,
      0.985
    ],
    "widthOnDoll": 112,
    "bounds": [
      0.012244897959183673,
      0.009966777408637873,
      0.9877551020408163,
      0.9900332225913622
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-operacionais-coldre-saque-rapido",
    "name": "Coldre saque rápido",
    "atlas": "assets/item-art/field-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 11,
    "sourceRect": [
      1023,
      663,
      191,
      255
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 57,
    "bounds": [
      0.015706806282722512,
      0.01568627450980392,
      0.9842931937172775,
      0.9882352941176471
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-operacionais-equipamento-de-escuta",
    "name": "Equipamento de escuta",
    "atlas": "assets/item-art/field-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 12,
    "sourceRect": [
      29,
      941,
      284,
      272
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 86,
    "bounds": [
      0.01056338028169014,
      0.011029411764705883,
      0.9859154929577465,
      0.9889705882352942
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-operacionais-estrepes",
    "name": "Estrepes",
    "atlas": "assets/item-art/field-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 13,
    "sourceRect": [
      352,
      957,
      268,
      245
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 53,
    "bounds": [
      0.011194029850746268,
      0.012244897959183673,
      0.9888059701492538,
      0.9877551020408163
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-operacionais-faixa-de-pregos",
    "name": "Faixa de pregos",
    "atlas": "assets/item-art/field-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 14,
    "sourceRect": [
      649,
      989,
      269,
      195
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 67,
    "bounds": [
      0.01486988847583643,
      0.015384615384615385,
      0.9888475836431226,
      0.9846153846153847
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-operacionais-isqueiro",
    "name": "Isqueiro",
    "atlas": "assets/item-art/field-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 15,
    "sourceRect": [
      1013,
      965,
      180,
      234
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 38,
    "bounds": [
      0.011111111111111112,
      0.01282051282051282,
      0.9833333333333333,
      0.9871794871794872
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-operacionais-oculos-de-visao-noturna",
    "name": "Óculos de visão noturna",
    "atlas": "assets/item-art/field-atlas-4.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 0,
    "sourceRect": [
      22,
      77,
      277,
      156
    ],
    "attachment": "eyes",
    "slot": "head",
    "anchor": [
      0.5,
      0.5
    ],
    "widthOnDoll": 127,
    "bounds": [
      0.01444043321299639,
      0.02564102564102564,
      0.9891696750902527,
      0.9807692307692307
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-operacionais-oculos-escuros",
    "name": "Óculos escuros",
    "atlas": "assets/item-art/field-atlas-4.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 1,
    "sourceRect": [
      333,
      116,
      277,
      109
    ],
    "attachment": "eyes",
    "slot": "head",
    "anchor": [
      0.5,
      0.5
    ],
    "widthOnDoll": 125,
    "bounds": [
      0.010830324909747292,
      0.027522935779816515,
      0.9927797833935018,
      0.9724770642201835
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-operacionais-pa",
    "name": "Pá",
    "atlas": "assets/item-art/field-atlas-4.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 2,
    "sourceRect": [
      686,
      15,
      195,
      308
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.58,
      0.3
    ],
    "widthOnDoll": 81,
    "bounds": [
      0.020512820512820513,
      0.00974025974025974,
      0.9846153846153847,
      0.987012987012987
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-operacionais-paraquedas",
    "name": "Paraquedas",
    "atlas": "assets/item-art/field-atlas-4.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 3,
    "sourceRect": [
      958,
      51,
      255,
      240
    ],
    "attachment": "back",
    "slot": "back",
    "anchor": [
      0.5,
      0.12
    ],
    "widthOnDoll": 135,
    "bounds": [
      0.011764705882352941,
      0.016666666666666666,
      0.9882352941176471,
      0.9875
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-operacionais-traje-de-mergulho",
    "name": "Traje de mergulho",
    "atlas": "assets/item-art/field-atlas-4.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 4,
    "sourceRect": [
      22,
      321,
      273,
      295
    ],
    "attachment": "outfit",
    "slot": "outfit",
    "anchor": [
      0.5,
      1
    ],
    "widthOnDoll": 325,
    "bounds": [
      0.014652014652014652,
      0.010169491525423728,
      0.989010989010989,
      0.9898305084745763
    ],
    "heightOnDoll": 490,
    "fullBody": true,
    "bodyAnchors": {
      "hand": [
        0.9,
        0.63
      ],
      "leftHand": [
        0.11,
        0.63
      ],
      "head": [
        0.5,
        0.22
      ],
      "eyes": [
        0.5,
        0.28
      ],
      "mask": [
        0.5,
        0.35
      ],
      "torso": [
        0.5,
        0.58
      ],
      "belt": [
        0.4,
        0.76
      ],
      "relic": [
        0.65,
        0.76
      ],
      "back": [
        0.25,
        0.5
      ],
      "feet": [
        0.5,
        1
      ],
      "neck": [
        0.5,
        0.46
      ],
      "wrist": [
        0.11,
        0.58
      ],
      "arms": [
        0.5,
        0.63
      ],
      "ammo": [
        0.3,
        0.8
      ]
    }
  },
  {
    "id": "sobrevivendo-ao-horror-operacionais-traje-espacial",
    "name": "Traje espacial",
    "atlas": "assets/item-art/field-atlas-4.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 5,
    "sourceRect": [
      337,
      321,
      267,
      295
    ],
    "attachment": "outfit",
    "slot": "outfit",
    "anchor": [
      0.5,
      1
    ],
    "widthOnDoll": 350,
    "bounds": [
      0.011235955056179775,
      0.010169491525423728,
      0.9850187265917603,
      0.9898305084745763
    ],
    "heightOnDoll": 490,
    "fullBody": true,
    "bodyAnchors": {
      "hand": [
        0.91,
        0.73
      ],
      "leftHand": [
        0.1,
        0.73
      ],
      "head": [
        0.5,
        0.21
      ],
      "eyes": [
        0.5,
        0.22
      ],
      "mask": [
        0.5,
        0.26
      ],
      "torso": [
        0.5,
        0.58
      ],
      "belt": [
        0.4,
        0.73
      ],
      "relic": [
        0.65,
        0.73
      ],
      "back": [
        0.25,
        0.5
      ],
      "feet": [
        0.5,
        1
      ],
      "neck": [
        0.5,
        0.43
      ],
      "wrist": [
        0.1,
        0.69
      ],
      "arms": [
        0.5,
        0.73
      ],
      "ammo": [
        0.3,
        0.8
      ]
    }
  },
  {
    "id": "sobrevivendo-ao-horror-medicamentos-antibiotico",
    "name": "Antibiótico",
    "atlas": "assets/item-art/field-atlas-4.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 6,
    "sourceRect": [
      703,
      362,
      159,
      231
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 34,
    "bounds": [
      0.025157232704402517,
      0.012987012987012988,
      0.9811320754716981,
      0.987012987012987
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-medicamentos-antidoto",
    "name": "Antídoto",
    "atlas": "assets/item-art/field-atlas-4.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 7,
    "sourceRect": [
      991,
      355,
      198,
      238
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 39,
    "bounds": [
      0.015151515151515152,
      0.012605042016806723,
      0.98989898989899,
      0.9831932773109243
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-medicamentos-antiemetico",
    "name": "Antiemético",
    "atlas": "assets/item-art/field-atlas-4.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 8,
    "sourceRect": [
      40,
      686,
      237,
      193
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 44,
    "bounds": [
      0.016877637130801686,
      0.015544041450777202,
      0.9873417721518988,
      0.9844559585492227
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-medicamentos-antihistaminico",
    "name": "Antihistamínico",
    "atlas": "assets/item-art/field-atlas-4.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 9,
    "sourceRect": [
      378,
      651,
      183,
      248
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 34,
    "bounds": [
      0.01639344262295082,
      0.012096774193548387,
      0.994535519125683,
      0.9919354838709677
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-medicamentos-anti-inflamatorio",
    "name": "Anti-inflamatório",
    "atlas": "assets/item-art/field-atlas-4.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 10,
    "sourceRect": [
      661,
      682,
      248,
      195
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 46,
    "bounds": [
      0.016129032258064516,
      0.015384615384615385,
      0.9879032258064516,
      0.9846153846153847
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-medicamentos-antitermico",
    "name": "Antitérmico",
    "atlas": "assets/item-art/field-atlas-4.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 11,
    "sourceRect": [
      1015,
      659,
      163,
      231
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 34,
    "bounds": [
      0.018404907975460124,
      0.008658008658008658,
      0.9754601226993865,
      0.987012987012987
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-medicamentos-broncodilatador",
    "name": "Broncodilatador",
    "atlas": "assets/item-art/field-atlas-4.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 12,
    "sourceRect": [
      54,
      937,
      211,
      283
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 42,
    "bounds": [
      0.014218009478672985,
      0.014134275618374558,
      0.985781990521327,
      0.9858657243816255
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-medicamentos-coagulante",
    "name": "Coagulante",
    "atlas": "assets/item-art/field-atlas-4.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 13,
    "sourceRect": [
      365,
      954,
      211,
      245
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 41,
    "bounds": [
      0.014218009478672985,
      0.0163265306122449,
      0.990521327014218,
      0.9877551020408163
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-modificacoes-carregador-rapido",
    "name": "Carregador rápido",
    "atlas": "assets/item-art/field-atlas-4.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 14,
    "sourceRect": [
      699,
      943,
      169,
      274
    ],
    "attachment": "ammo",
    "slot": "adjustment",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 48,
    "bounds": [
      0.023668639053254437,
      0.010948905109489052,
      0.9881656804733728,
      0.9890510948905109
    ],
    "modification": "loader"
  },
  {
    "id": "sobrevivendo-ao-horror-modificacoes-bateria-potente",
    "name": "Bateria potente",
    "atlas": "assets/item-art/field-atlas-4.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 15,
    "sourceRect": [
      976,
      961,
      233,
      227
    ],
    "attachment": "belt",
    "slot": "adjustment",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 63,
    "bounds": [
      0.012875536480686695,
      0.013215859030837005,
      0.9871244635193133,
      0.9911894273127754
    ],
    "modification": "battery"
  },
  {
    "id": "arquivos-secretos-2-medicamentos-bandagem",
    "name": "Bandagem",
    "atlas": "assets/item-art/field-atlas-5.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 0,
    "sourceRect": [
      38,
      108,
      256,
      235
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 52,
    "bounds": [
      0.015625,
      0.01276595744680851,
      0.98828125,
      0.9872340425531915
    ]
  },
  {
    "id": "arquivos-secretos-2-acessorios-bussola",
    "name": "Bússola",
    "atlas": "assets/item-art/field-atlas-5.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 1,
    "sourceRect": [
      335,
      35,
      279,
      302
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5,
      0.6
    ],
    "widthOnDoll": 50,
    "bounds": [
      0.010752688172043012,
      0.013245033112582781,
      0.985663082437276,
      0.9900662251655629
    ]
  },
  {
    "id": "arquivos-secretos-2-acessorios-caixa-de-ferramentas",
    "name": "Caixa de ferramentas",
    "atlas": "assets/item-art/field-atlas-5.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 2,
    "sourceRect": [
      641,
      97,
      288,
      234
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.51,
      0.18
    ],
    "widthOnDoll": 82,
    "bounds": [
      0.010416666666666666,
      0.01282051282051282,
      0.9895833333333334,
      0.9871794871794872
    ]
  },
  {
    "id": "arquivos-secretos-2-medicamentos-dose-de-alcool",
    "name": "Dose de Álcool",
    "atlas": "assets/item-art/field-atlas-5.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 3,
    "sourceRect": [
      1002,
      63,
      187,
      271
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 38,
    "bounds": [
      0.016042780748663103,
      0.01107011070110701,
      0.983957219251337,
      0.988929889298893
    ]
  },
  {
    "id": "arquivos-secretos-2-acessorios-incenso",
    "name": "Incenso",
    "atlas": "assets/item-art/field-atlas-5.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 4,
    "sourceRect": [
      29,
      380,
      283,
      274
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 75,
    "bounds": [
      0.01060070671378092,
      0.010948905109489052,
      0.9893992932862191,
      0.9890510948905109
    ]
  },
  {
    "id": "arquivos-secretos-2-acessorios-kit-de-escalada",
    "name": "Kit de escalada",
    "atlas": "assets/item-art/field-atlas-5.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 5,
    "sourceRect": [
      334,
      375,
      292,
      286
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 79,
    "bounds": [
      0.010273972602739725,
      0.01048951048951049,
      0.9897260273972602,
      0.9895104895104895
    ]
  },
  {
    "id": "arquivos-secretos-2-acessorios-pedra-de-amolar",
    "name": "Pedra de amolar",
    "atlas": "assets/item-art/field-atlas-5.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 6,
    "sourceRect": [
      641,
      413,
      295,
      238
    ],
    "attachment": "belt",
    "slot": "utility",
    "anchor": [
      0.5,
      0.13
    ],
    "widthOnDoll": 57,
    "bounds": [
      0.010169491525423728,
      0.012605042016806723,
      0.9864406779661017,
      0.9831932773109243
    ]
  },
  {
    "id": "livro-base-paranormais-selo-paranormal-de-1-circulo",
    "name": "Selo paranormal de 1º círculo",
    "atlas": "assets/item-art/paranormal-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 0,
    "sourceRect": [
      51,
      73,
      229,
      199
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5,
      0.82
    ],
    "widthOnDoll": 56,
    "bounds": [
      0.017467248908296942,
      0.020100502512562814,
      0.982532751091703,
      0.9798994974874372
    ]
  },
  {
    "id": "livro-base-paranormais-selo-paranormal-de-2-circulo",
    "name": "Selo paranormal de 2º círculo",
    "atlas": "assets/item-art/paranormal-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 1,
    "sourceRect": [
      365,
      58,
      234,
      208
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5,
      0.82
    ],
    "widthOnDoll": 60,
    "bounds": [
      0.017094017094017096,
      0.019230769230769232,
      0.9829059829059829,
      0.9807692307692307
    ]
  },
  {
    "id": "livro-base-paranormais-selo-paranormal-de-3-circulo",
    "name": "Selo paranormal de 3º círculo",
    "atlas": "assets/item-art/paranormal-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 2,
    "sourceRect": [
      642,
      76,
      280,
      190
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5,
      0.8
    ],
    "widthOnDoll": 66,
    "bounds": [
      0.014285714285714285,
      0.021052631578947368,
      0.9857142857142858,
      0.9789473684210527
    ]
  },
  {
    "id": "livro-base-paranormais-selo-paranormal-de-4-circulo",
    "name": "Selo paranormal de 4º círculo",
    "atlas": "assets/item-art/paranormal-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 3,
    "sourceRect": [
      979,
      42,
      239,
      253
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5,
      0.82
    ],
    "widthOnDoll": 61,
    "bounds": [
      0.016736401673640166,
      0.019762845849802372,
      0.9832635983263598,
      0.9841897233201581
    ]
  },
  {
    "id": "livro-base-paranormais-coracao-pulsante",
    "name": "Coração pulsante",
    "atlas": "assets/item-art/paranormal-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 4,
    "sourceRect": [
      64,
      338,
      204,
      254
    ],
    "attachment": "neck",
    "slot": "neck",
    "anchor": [
      0.5,
      0.12
    ],
    "widthOnDoll": 44,
    "bounds": [
      0.024509803921568627,
      0.01968503937007874,
      0.9803921568627451,
      0.984251968503937
    ]
  },
  {
    "id": "livro-base-paranormais-cranio-espiral",
    "name": "Crânio espiral",
    "atlas": "assets/item-art/paranormal-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 5,
    "sourceRect": [
      377,
      342,
      187,
      257
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5,
      0.75
    ],
    "widthOnDoll": 60,
    "bounds": [
      0.0213903743315508,
      0.019455252918287938,
      0.9786096256684492,
      0.980544747081712
    ]
  },
  {
    "id": "livro-base-paranormais-frasco-de-lodo",
    "name": "Frasco de lodo",
    "atlas": "assets/item-art/paranormal-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 6,
    "sourceRect": [
      665,
      336,
      221,
      270
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.48,
      0.78
    ],
    "widthOnDoll": 47,
    "bounds": [
      0.02262443438914027,
      0.014814814814814815,
      0.9819004524886877,
      0.9851851851851852
    ]
  },
  {
    "id": "livro-base-paranormais-pergaminho-da-pertinacia",
    "name": "Pergaminho da pertinácia",
    "atlas": "assets/item-art/paranormal-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 7,
    "sourceRect": [
      967,
      342,
      263,
      252
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5,
      0.82
    ],
    "widthOnDoll": 80,
    "bounds": [
      0.015209125475285171,
      0.01984126984126984,
      0.9809885931558935,
      0.9841269841269841
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-catalisador-ampliador",
    "name": "Catalisador ampliador",
    "atlas": "assets/item-art/paranormal-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 8,
    "sourceRect": [
      74,
      634,
      189,
      289
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.49,
      0.81
    ],
    "widthOnDoll": 67,
    "bounds": [
      0.026455026455026454,
      0.01384083044982699,
      0.9788359788359788,
      0.9826989619377162
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-catalisador-perturbador",
    "name": "Catalisador perturbador",
    "atlas": "assets/item-art/paranormal-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 9,
    "sourceRect": [
      358,
      636,
      224,
      270
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5,
      0.12
    ],
    "widthOnDoll": 63,
    "bounds": [
      0.017857142857142856,
      0.018518518518518517,
      0.9821428571428571,
      0.9851851851851852
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-catalisador-potencializador",
    "name": "Catalisador potencializador",
    "atlas": "assets/item-art/paranormal-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 10,
    "sourceRect": [
      693,
      637,
      185,
      280
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.49,
      0.83
    ],
    "widthOnDoll": 61,
    "bounds": [
      0.021621621621621623,
      0.014285714285714285,
      0.9783783783783784,
      0.9857142857142858
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-catalisador-prolongador",
    "name": "Catalisador prolongador",
    "atlas": "assets/item-art/paranormal-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 11,
    "sourceRect": [
      1036,
      634,
      126,
      281
    ],
    "attachment": "neck",
    "slot": "neck",
    "anchor": [
      0.5,
      0.08
    ],
    "widthOnDoll": 37,
    "bounds": [
      0.031746031746031744,
      0.014234875444839857,
      0.9603174603174603,
      0.9857651245551602
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-ligacao-direta-infernal",
    "name": "Ligação direta infernal",
    "atlas": "assets/item-art/paranormal-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 12,
    "sourceRect": [
      32,
      959,
      271,
      243
    ],
    "attachment": "vehicle",
    "slot": "vehicle",
    "anchor": [
      0.5,
      0.54
    ],
    "widthOnDoll": 132,
    "bounds": [
      0.014760147601476014,
      0.01646090534979424,
      0.985239852398524,
      0.9835390946502057
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-medidor-de-condicao-vertebral",
    "name": "Medidor de condição vertebral",
    "atlas": "assets/item-art/paranormal-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 13,
    "sourceRect": [
      343,
      946,
      256,
      256
    ],
    "attachment": "torso",
    "slot": "outfit",
    "anchor": [
      0.5,
      0.4
    ],
    "widthOnDoll": 172,
    "bounds": [
      0.015625,
      0.01953125,
      0.984375,
      0.98046875
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-pe-de-morto",
    "name": "Pé de morto",
    "atlas": "assets/item-art/paranormal-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 14,
    "sourceRect": [
      653,
      966,
      291,
      236
    ],
    "attachment": "feet",
    "slot": "feet",
    "anchor": [
      0.5,
      0.98
    ],
    "widthOnDoll": 225,
    "bounds": [
      0.01718213058419244,
      0.01694915254237288,
      0.9862542955326461,
      0.9830508474576272
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-pendrive-selado",
    "name": "Pendrive selado",
    "atlas": "assets/item-art/paranormal-atlas-1.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 15,
    "sourceRect": [
      1040,
      951,
      120,
      254
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5,
      0.73
    ],
    "widthOnDoll": 29,
    "bounds": [
      0.03333333333333333,
      0.015748031496062992,
      0.9583333333333334,
      0.984251968503937
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-valete-da-salvacao",
    "name": "Valete da salvação",
    "atlas": "assets/item-art/paranormal-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 0,
    "sourceRect": [
      80,
      52,
      179,
      239
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5,
      0.82
    ],
    "widthOnDoll": 49,
    "bounds": [
      0.01675977653631285,
      0.016736401673640166,
      0.9776536312849162,
      0.9790794979079498
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-ampulheta-do-tempo-sofrido",
    "name": "Ampulheta do Tempo Sofrido",
    "atlas": "assets/item-art/paranormal-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 1,
    "sourceRect": [
      364,
      33,
      209,
      276
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.49,
      0.82
    ],
    "widthOnDoll": 63,
    "bounds": [
      0.019138755980861243,
      0.018115942028985508,
      0.9760765550239234,
      0.9855072463768116
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-arreio-neural",
    "name": "Arreio Neural",
    "atlas": "assets/item-art/paranormal-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 2,
    "sourceRect": [
      653,
      26,
      262,
      288
    ],
    "attachment": "head",
    "slot": "head",
    "anchor": [
      0.5,
      0.5
    ],
    "widthOnDoll": 200,
    "bounds": [
      0.015267175572519083,
      0.013888888888888888,
      0.9923664122137404,
      0.9861111111111112
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-camera-obscura",
    "name": "Câmera Obscura",
    "atlas": "assets/item-art/paranormal-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 3,
    "sourceRect": [
      977,
      55,
      250,
      237
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.19,
      0.71
    ],
    "widthOnDoll": 79,
    "bounds": [
      0.016,
      0.02109704641350211,
      0.98,
      0.9831223628691983
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-centrifugador-existencial",
    "name": "Centrifugador Existencial",
    "atlas": "assets/item-art/paranormal-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 4,
    "sourceRect": [
      29,
      363,
      275,
      245
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5,
      0.84
    ],
    "widthOnDoll": 79,
    "bounds": [
      0.014545454545454545,
      0.0163265306122449,
      0.9927272727272727,
      0.9836734693877551
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-conector-de-membros",
    "name": "Conector de Membros",
    "atlas": "assets/item-art/paranormal-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 5,
    "sourceRect": [
      358,
      348,
      240,
      257
    ],
    "attachment": "wrist",
    "slot": "arms",
    "anchor": [
      0.27,
      0.83
    ],
    "widthOnDoll": 58,
    "bounds": [
      0.016666666666666666,
      0.01556420233463035,
      0.9791666666666666,
      0.980544747081712
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-dose-d-a-praga",
    "name": "Dose d’A Praga",
    "atlas": "assets/item-art/paranormal-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 6,
    "sourceRect": [
      694,
      340,
      208,
      272
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.45,
      0.76
    ],
    "widthOnDoll": 46,
    "bounds": [
      0.019230769230769232,
      0.014705882352941176,
      0.9759615384615384,
      0.9852941176470589
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-enxame-fantasmagorico",
    "name": "Enxame Fantasmagórico",
    "atlas": "assets/item-art/paranormal-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 7,
    "sourceRect": [
      950,
      316,
      290,
      301
    ],
    "attachment": "back",
    "slot": "back",
    "anchor": [
      0.5,
      0.43
    ],
    "widthOnDoll": 188,
    "bounds": [
      0.013793103448275862,
      0.013289036544850499,
      0.9862068965517241,
      0.9867109634551495
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-espelho-refletor",
    "name": "Espelho Refletor",
    "atlas": "assets/item-art/paranormal-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 8,
    "sourceRect": [
      85,
      633,
      165,
      288
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.23,
      0.82
    ],
    "widthOnDoll": 83,
    "bounds": [
      0.024242424242424242,
      0.013888888888888888,
      0.9757575757575757,
      0.9826388888888888
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-fuzil-alheio",
    "name": "Fuzil Alheio",
    "atlas": "assets/item-art/paranormal-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 9,
    "sourceRect": [
      309,
      637,
      312,
      274
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.3686,
      0.7445
    ],
    "widthOnDoll": 257,
    "bounds": [
      0.01282051282051282,
      0.014598540145985401,
      0.9839743589743589,
      0.9854014598540146
    ],
    "angle": -35
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-injecao-de-lodo",
    "name": "Injeção de Lodo",
    "atlas": "assets/item-art/paranormal-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 10,
    "sourceRect": [
      651,
      648,
      268,
      254
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.36,
      0.64
    ],
    "widthOnDoll": 66,
    "bounds": [
      0.018656716417910446,
      0.015748031496062992,
      0.9850746268656716,
      0.984251968503937
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-instantaneo-mortal",
    "name": "Instantâneo Mortal",
    "atlas": "assets/item-art/paranormal-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 11,
    "sourceRect": [
      967,
      659,
      262,
      234
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.2,
      0.78
    ],
    "widthOnDoll": 72,
    "bounds": [
      0.015267175572519083,
      0.017094017094017096,
      0.9809160305343512,
      0.9829059829059829
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-mandibula-agonizante",
    "name": "Mandíbula Agonizante",
    "atlas": "assets/item-art/paranormal-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 12,
    "sourceRect": [
      29,
      973,
      268,
      215
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.23,
      0.44
    ],
    "widthOnDoll": 72,
    "bounds": [
      0.014925373134328358,
      0.018604651162790697,
      0.9850746268656716,
      0.986046511627907
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-a-primeira-adaga",
    "name": "A Primeira Adaga",
    "atlas": "assets/item-art/paranormal-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 13,
    "sourceRect": [
      340,
      943,
      266,
      269
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.2143,
      0.7323
    ],
    "widthOnDoll": 112,
    "bounds": [
      0.015037593984962405,
      0.01858736059479554,
      0.9849624060150376,
      0.9814126394052045
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-projetil-de-lodo-curto",
    "name": "Projétil de Lodo, curto",
    "atlas": "assets/item-art/paranormal-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 14,
    "sourceRect": [
      718,
      986,
      130,
      218
    ],
    "attachment": "ammo",
    "slot": "ammo",
    "anchor": [
      0.5,
      0.84
    ],
    "widthOnDoll": 26,
    "bounds": [
      0.038461538461538464,
      0.01834862385321101,
      0.9692307692307692,
      0.9862385321100917
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-projetil-de-lodo-longo",
    "name": "Projétil de Lodo, longo",
    "atlas": "assets/item-art/paranormal-atlas-2.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 15,
    "sourceRect": [
      1044,
      920,
      104,
      292
    ],
    "attachment": "ammo",
    "slot": "ammo",
    "anchor": [
      0.5,
      0.84
    ],
    "widthOnDoll": 24,
    "bounds": [
      0.028846153846153848,
      0.017123287671232876,
      0.9519230769230769,
      0.9828767123287672
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-radio-chiador",
    "name": "Rádio Chiador",
    "atlas": "assets/item-art/paranormal-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 0,
    "sourceRect": [
      29,
      24,
      281,
      275
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.45,
      0.43
    ],
    "widthOnDoll": 81,
    "bounds": [
      0.014234875444839857,
      0.014545454545454545,
      0.9857651245551602,
      0.9854545454545455
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-repositorio-do-fracasso",
    "name": "Repositório do Fracasso",
    "atlas": "assets/item-art/paranormal-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 1,
    "sourceRect": [
      362,
      79,
      218,
      217
    ],
    "attachment": "belt",
    "slot": "paranormal",
    "anchor": [
      0.49,
      0.14
    ],
    "widthOnDoll": 54,
    "bounds": [
      0.01834862385321101,
      0.018433179723502304,
      0.9862385321100917,
      0.9815668202764977
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-retalho-tenebroso",
    "name": "Retalho Tenebroso",
    "atlas": "assets/item-art/paranormal-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 2,
    "sourceRect": [
      638,
      74,
      290,
      227
    ],
    "attachment": "mask",
    "slot": "head",
    "anchor": [
      0.5,
      0.5
    ],
    "widthOnDoll": 117,
    "bounds": [
      0.017241379310344827,
      0.022026431718061675,
      0.9862068965517241,
      0.9823788546255506
    ]
  },
  {
    "id": "sobrevivendo-ao-horror-paranormais-tabula-do-saber-custoso",
    "name": "Tábula do Saber Custoso",
    "atlas": "assets/item-art/paranormal-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 3,
    "sourceRect": [
      992,
      28,
      210,
      276
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.49,
      0.83
    ],
    "widthOnDoll": 74,
    "bounds": [
      0.01904761904761905,
      0.014492753623188406,
      0.9809523809523809,
      0.9855072463768116
    ]
  },
  {
    "id": "arquivos-secretos-1-paranormais-agrupador-ritualistico",
    "name": "Agrupador ritualístico",
    "atlas": "assets/item-art/paranormal-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 4,
    "sourceRect": [
      17,
      393,
      302,
      188
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.5,
      0.79
    ],
    "widthOnDoll": 75,
    "bounds": [
      0.013245033112582781,
      0.02127659574468085,
      0.9867549668874173,
      0.9787234042553191
    ]
  },
  {
    "id": "arquivos-secretos-1-paranormais-amuleto-sinalizador-de-elemento",
    "name": "Amuleto sinalizador de <Elemento>",
    "atlas": "assets/item-art/paranormal-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 5,
    "sourceRect": [
      361,
      334,
      220,
      273
    ],
    "attachment": "neck",
    "slot": "neck",
    "anchor": [
      0.5,
      0.06
    ],
    "widthOnDoll": 76,
    "bounds": [
      0.01818181818181818,
      0.014652014652014652,
      0.9772727272727273,
      0.9816849816849816
    ]
  },
  {
    "id": "arquivos-secretos-1-paranormais-rubra",
    "name": "Rubra",
    "atlas": "assets/item-art/paranormal-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 6,
    "sourceRect": [
      681,
      350,
      205,
      252
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.49,
      0.27
    ],
    "widthOnDoll": 49,
    "bounds": [
      0.024390243902439025,
      0.015873015873015872,
      0.9804878048780488,
      0.9801587301587301
    ]
  },
  {
    "id": "arquivos-secretos-1-paranormais-arpao-do-pescador",
    "name": "Arpão do pescador",
    "atlas": "assets/item-art/paranormal-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 7,
    "sourceRect": [
      948,
      331,
      292,
      281
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.2774,
      0.7438
    ],
    "widthOnDoll": 235,
    "bounds": [
      0.0136986301369863,
      0.014234875444839857,
      0.9863013698630136,
      0.9857651245551602
    ],
    "angle": -20
  },
  {
    "id": "arquivos-secretos-1-paranormais-combustivel-de-sangue",
    "name": "Combustível de sangue",
    "atlas": "assets/item-art/paranormal-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 8,
    "sourceRect": [
      67,
      650,
      195,
      268
    ],
    "attachment": "ammo",
    "slot": "ammo",
    "anchor": [
      0.48,
      0.1
    ],
    "widthOnDoll": 71,
    "bounds": [
      0.020512820512820513,
      0.018656716417910446,
      0.9794871794871794,
      0.9850746268656716
    ]
  },
  {
    "id": "arquivos-secretos-1-paranormais-marreta-transtornada",
    "name": "Marreta transtornada",
    "atlas": "assets/item-art/paranormal-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 9,
    "sourceRect": [
      327,
      634,
      302,
      292
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.2748,
      0.6986
    ],
    "widthOnDoll": 202,
    "bounds": [
      0.013245033112582781,
      0.0136986301369863,
      0.9867549668874173,
      0.9863013698630136
    ]
  },
  {
    "id": "arquivos-secretos-2-paranormais-machado-do-mutilador",
    "name": "Machado do Mutilador",
    "atlas": "assets/item-art/paranormal-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 10,
    "sourceRect": [
      641,
      650,
      299,
      271
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.2642,
      0.6827
    ],
    "widthOnDoll": 180,
    "bounds": [
      0.013377926421404682,
      0.01845018450184502,
      0.9866220735785953,
      0.985239852398524
    ]
  },
  {
    "id": "arquivos-secretos-2-paranormais-elmo-do-colosso",
    "name": "Elmo do Colosso",
    "atlas": "assets/item-art/paranormal-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 11,
    "sourceRect": [
      971,
      644,
      258,
      282
    ],
    "attachment": "head",
    "slot": "head",
    "anchor": [
      0.5,
      0.48
    ],
    "widthOnDoll": 215,
    "bounds": [
      0.015503875968992248,
      0.010638297872340425,
      0.9844961240310077,
      0.9858156028368794
    ],
    "replaceHead": true
  },
  {
    "id": "arquivos-secretos-2-paranormais-manoplas-do-colosso",
    "name": "Manoplas do Colosso",
    "atlas": "assets/item-art/paranormal-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 12,
    "sourceRect": [
      20,
      984,
      292,
      231
    ],
    "attachment": "wrist",
    "slot": "arms",
    "anchor": [
      0.5,
      0.83
    ],
    "widthOnDoll": 122,
    "bounds": [
      0.017123287671232876,
      0.017316017316017316,
      0.9828767123287672,
      0.9783549783549783
    ],
    "parts": [
      {
        "sourceRect": [
          20,
          984,
          147,
          230
        ],
        "attachment": "wrist",
        "side": "screenLeft",
        "anchor": [
          0.5,
          0.8
        ],
        "widthOnDoll": 57
      },
      {
        "sourceRect": [
          164,
          984,
          148,
          231
        ],
        "attachment": "wrist",
        "side": "screenRight",
        "anchor": [
          0.5,
          0.8
        ],
        "widthOnDoll": 57
      }
    ]
  },
  {
    "id": "arquivos-secretos-2-paranormais-punhal-x",
    "name": "Punhal X",
    "atlas": "assets/item-art/paranormal-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 13,
    "sourceRect": [
      339,
      958,
      252,
      261
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.2579,
      0.7356
    ],
    "widthOnDoll": 112,
    "bounds": [
      0.015873015873015872,
      0.019157088122605363,
      0.9841269841269841,
      0.9808429118773946
    ]
  },
  {
    "id": "arquivos-secretos-2-paranormais-sniper-fantasma",
    "name": "Sniper Fantasma",
    "atlas": "assets/item-art/paranormal-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 14,
    "sourceRect": [
      623,
      948,
      322,
      279
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.3944,
      0.724
    ],
    "widthOnDoll": 270,
    "bounds": [
      0.015527950310559006,
      0.017921146953405017,
      0.9875776397515528,
      0.985663082437276
    ],
    "angle": -35
  },
  {
    "id": "arquivos-secretos-2-paranormais-a-antena",
    "name": "A Antena",
    "atlas": "assets/item-art/paranormal-atlas-3.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 15,
    "sourceRect": [
      1008,
      934,
      215,
      306
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.2558,
      0.7778
    ],
    "widthOnDoll": 123,
    "bounds": [
      0.018604651162790697,
      0.013071895424836602,
      0.9813953488372092,
      0.9869281045751634
    ]
  },
  {
    "id": "arquivos-secretos-2-paranormais-catalisador-sofisticado-e-horrorizado",
    "name": "Catalisador sofisticado e horrorizado",
    "atlas": "assets/item-art/paranormal-atlas-4.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 0,
    "sourceRect": [
      20,
      61,
      292,
      233
    ],
    "attachment": "neck",
    "slot": "neck",
    "anchor": [
      0.5,
      0.23
    ],
    "widthOnDoll": 178,
    "bounds": [
      0.017123287671232876,
      0.02145922746781116,
      0.9863013698630136,
      0.9785407725321889
    ]
  },
  {
    "id": "arquivos-secretos-2-paranormais-faca-predadora",
    "name": "Faca Predadora",
    "atlas": "assets/item-art/paranormal-atlas-4.png",
    "imageWidth": 1254,
    "imageHeight": 1254,
    "cols": 4,
    "rows": 4,
    "cell": 1,
    "sourceRect": [
      350,
      43,
      242,
      257
    ],
    "attachment": "hand",
    "slot": "weapon",
    "anchor": [
      0.2231,
      0.7743
    ],
    "widthOnDoll": 105,
    "bounds": [
      0.01652892561983471,
      0.01556420233463035,
      0.9834710743801653,
      0.9844357976653697
    ]
  }
]);

export const ITEM_ART = Object.freeze([...ORIGINAL_ITEM_ART, ...ADDITIONAL_ITEMS.map(item => {
 const source=ORIGINAL_ITEM_ART.find(a=>a.name===item.visual.icon);
 if(!source)throw Error(`Missing catalog reference: ${item.name}`);
 const {parts,fullBody,bodyAnchors,modification,...art}=source;
 return {...art,id:item.id,name:item.name,slot:item.visual.slot,attachment:item.visual.kind==='held'?'hand':art.attachment,compositionKind:item.visual.kind,variantKey:item.visual.variant};
})]);
const byId = new Map(ITEM_ART.map(art => [art.id, art]));
const byName = new Map(ITEM_ART.map(art => [art.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(), art]));
export function artForItem(entry) {
  if (!entry) return null;
  const name = String(entry.name ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return byId.get(entry.id) ?? byName.get(name) ?? null;
}

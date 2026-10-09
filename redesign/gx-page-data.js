/* Catalog used by this RXV 2 page only. */
Object.assign(window.GX = window.GX || {}, {
  "IMG_BASE": "https://959cd70c.delivery.rocketcdn.me/wp-content/uploads/2026/09/",
  "COLORS": {
    "bright-white": {
      "name": "Bright White",
      "hex": "#f1f0ee",
      "file": "White"
    },
    "ivory": {
      "name": "Ivory",
      "hex": "#ebe4d5",
      "file": "Ivory"
    },
    "almond": {
      "name": "Almond",
      "hex": "#a99c8b",
      "file": "Almond"
    },
    "platinum": {
      "name": "Platinum",
      "hex": "#a7a8ad",
      "file": "Platinum"
    },
    "slate-grey": {
      "name": "Slate Grey",
      "hex": "#7d7a7b",
      "file": "Slate"
    },
    "ocean-grey": {
      "name": "Ocean Grey",
      "hex": "#8ea8b7",
      "file": "OceanGrey"
    },
    "metallic-charcoal": {
      "name": "Metallic Charcoal",
      "hex": "#4b4c4e",
      "file": "MetallicCharcoal"
    },
    "black": {
      "name": "Black",
      "hex": "#161616",
      "file": "Black"
    },
    "flame-red": {
      "name": "Flame Red",
      "hex": "#c41c1a",
      "file": "FlameRed"
    },
    "inferno-red": {
      "name": "Inferno Red",
      "hex": "#8e1a20",
      "file": "InfernoRed"
    },
    "electric-blue": {
      "name": "Electric Blue",
      "hex": "#1f4fa0",
      "file": "ElectricBlue"
    },
    "patriot-blue": {
      "name": "Patriot Blue",
      "hex": "#1b2a57",
      "file": "PatriotBlue"
    },
    "matte-green": {
      "name": "Matte Green",
      "hex": "#3d4b3e",
      "file": "MatteGreen"
    },
    "forest-green": {
      "name": "Forest Green",
      "hex": "#135c3e",
      "file": "ForestGreen"
    }
  },
  "COLOR_ORDER": [
    "bright-white",
    "ivory",
    "almond",
    "platinum",
    "slate-grey",
    "ocean-grey",
    "metallic-charcoal",
    "black",
    "flame-red",
    "inferno-red",
    "electric-blue",
    "patriot-blue",
    "matte-green",
    "forest-green"
  ],
  "NEAR_COLOR": {
    "flame-red": "inferno-red",
    "inferno-red": "flame-red",
    "electric-blue": "patriot-blue",
    "patriot-blue": "electric-blue",
    "ivory": "bright-white",
    "almond": "bright-white",
    "forest-green": "matte-green",
    "matte-green": "forest-green",
    "slate-grey": "platinum",
    "ocean-grey": "platinum",
    "metallic-charcoal": "black"
  },
  "POWER": {
    "48v": {
      "cls": "electric",
      "name": "48V AC Electric",
      "short": "48V Electric",
      "icon": "lightning",
      "blurb": "Lead-acid battery pack"
    },
    "lithium": {
      "cls": "electric",
      "name": "ELiTE Lithium",
      "short": "ELiTE Lithium",
      "icon": "battery-charging",
      "blurb": "Maintenance-free lithium"
    },
    "gas": {
      "cls": "gas",
      "name": "13.5-hp EFI Gas",
      "short": "Gas",
      "icon": "gas-pump",
      "blurb": "13.5-hp fuel-injected engine"
    }
  },
  "SERIES": [
    {
      "id": "rxv2",
      "name": "RXV 2",
      "seats": 2,
      "tagline": "Two-seat golf & neighborhood cart",
      "featured": "RXV2_ValorS2B_MatteGreen_MY27_v39_960x720_1.png",
      "trims": [
        {
          "id": "valor-s",
          "name": "Valor S",
          "family": "Valor",
          "rank": 1,
          "equiv": "valor-s",
          "power": {
            "electric": {
              "kind": "48v",
              "price": 9274
            },
            "gas": {
              "price": 9487
            }
          },
          "colors": [
            "bright-white",
            "platinum",
            "black",
            "inferno-red",
            "matte-green"
          ],
          "defaultColor": "matte-green",
          "img": "RXV2_ValorS_{C}_MY27_v39_960x720_1.png",
          "highlights": [
            "Blacked-out badging",
            "Kenda K500 traction tires",
            "Lowest price"
          ],
          "spec": {
            "badging": "Blacked-out",
            "tires": "Kenda K500 · 10\" steel",
            "height": "Standard",
            "tech": null,
            "seating": "Standard"
          }
        },
        {
          "id": "valor-s-plus",
          "name": "Valor S+",
          "family": "Valor",
          "rank": 2,
          "equiv": "valor-s-plus",
          "power": {
            "electric": {
              "kind": "48v",
              "price": 9854
            },
            "gas": {
              "price": 10067
            }
          },
          "colors": [
            "bright-white",
            "platinum",
            "black",
            "inferno-red",
            "matte-green"
          ],
          "defaultColor": "matte-green",
          "img": "RXV2_ValorS_{C}_MY27_v39_960x720_1.png",
          "approx": "Photo shows Valor S styling",
          "imgOverride": {
            "matte-green": "RXV2_ValorS2B_MatteGreen_MY27_v39_960x720_1.png"
          },
          "highlights": [
            "Metallic badging",
            "Hole-N-One turf tires on 12\" alloys"
          ],
          "spec": {
            "badging": "Metallic",
            "tires": "Hole-N-One · 12\" alloy",
            "height": "Standard",
            "tech": null,
            "seating": "Standard"
          }
        },
        {
          "id": "freedom",
          "name": "Freedom",
          "family": "Freedom",
          "rank": 3,
          "equiv": "freedom",
          "power": {
            "electric": {
              "kind": "lithium",
              "price": 11449
            },
            "gas": {
              "price": 9909
            }
          },
          "colors": [
            "bright-white",
            "ivory",
            "almond",
            "platinum",
            "slate-grey",
            "ocean-grey",
            "metallic-charcoal",
            "black",
            "inferno-red",
            "patriot-blue",
            "matte-green",
            "forest-green"
          ],
          "defaultColor": "forest-green",
          "img": "RXV2_Freedom_{C}_MY27_v39_960x720_1.png",
          "imgOverride": {
            "matte-green": "RXV2_Freedom_MatteGreen_MY27_v39_960x720_2.png"
          },
          "highlights": [
            "12 colors",
            "Tech, seating & wheel upgrades",
            "Maintenance-free ELiTE option"
          ],
          "spec": {
            "badging": null,
            "tires": "Upgradeable",
            "height": "Standard",
            "tech": "Optional",
            "seating": "Premium optional"
          }
        }
      ]
    }
  ],
  "SPEC_ROWS": [
    {
      "key": "seats",
      "label": "Seats"
    },
    {
      "key": "power",
      "label": "Power"
    },
    {
      "key": "height",
      "label": "Ride height"
    },
    {
      "key": "badging",
      "label": "Badging"
    },
    {
      "key": "tires",
      "label": "Tires"
    },
    {
      "key": "tech",
      "label": "Tech package"
    },
    {
      "key": "seating",
      "label": "Seating"
    },
    {
      "key": "colors",
      "label": "Colors"
    }
  ],
  "PAGE_SERIES": "rxv2",
  "DEFAULT": {
    "series": "rxv2",
    "trim": "freedom",
    "power": "gas",
    "color": "forest-green"
  }
});

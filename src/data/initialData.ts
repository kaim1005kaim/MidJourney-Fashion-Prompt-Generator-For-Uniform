import { Brand } from '../types';

export const initialBrands: Brand[] = [
  {
    id: 1,
    name: "Chanel",
    eraStart: "1920",
    eraEnd: "present",
    coreStyle: "Timeless elegance",
    signatureElements: ["tweed jacket", "quilted bag", "pearl necklace", "little black dress"],
    colorPalette: ["black", "white", "beige", "navy"]
  },
  {
    id: 2,
    name: "Dior",
    eraStart: "1940",
    eraEnd: "present",
    coreStyle: "New Look silhouette",
    signatureElements: ["bar jacket", "full skirt", "cinched waist", "floral dress"],
    colorPalette: ["gray", "pink", "cream", "navy"]
  }
];

interface PhraseVariation {
  base_term: string;
  variations: string[];
}

export const phraseVariations = {
  materials: [
    {
      base_term: "silk",
      variations: ["flowing silk", "lustrous silk", "delicate silk", "raw silk"]
    },
    {
      base_term: "wool",
      variations: ["fine wool", "textured wool", "brushed wool", "merino wool"]
    },
    {
      base_term: "leather",
      variations: ["soft leather", "patent leather", "vintage leather", "metallic leather"]
    }
  ],
  silhouettes: [
    {
      base_term: "dress",
      variations: ["a flowing dress", "an elegant gown", "a structured dress", "a draped dress"]
    },
    {
      base_term: "suit",
      variations: ["a tailored suit", "a power suit", "an evening suit", "a structured suit"]
    }
  ],
  lighting: [
    {
      base_term: "studio",
      variations: ["studio lighting", "dramatic lighting", "soft diffused lighting", "natural lighting"]
    },
    {
      base_term: "outdoor",
      variations: ["golden hour lighting", "backlit", "ambient lighting", "dramatic shadows"]
    }
  ],
  backgrounds: [
    {
      base_term: "solid",
      variations: ["solid [color] backdrop", "gradient [color] background", "[color] studio background"]
    },
    {
      base_term: "location",
      variations: ["urban [color] street scene", "minimalist [color] interior", "abstract [color] environment"]
    }
  ]
};
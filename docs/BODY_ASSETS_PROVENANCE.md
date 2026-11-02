# Pochodzenie ilustracji Pomiary 3.0

Data: 2026-11-02. Metoda: wbudowane narzędzie OpenAI `image_gen` (umiejętność imagegen), bez zewnętrznych zdjęć, modeli osób, stocków lub `body.png`. To oryginalne wygenerowane ilustracje fitness na potrzeby Pakierni. Pole `license` adaptera zawiera identyfikację tego pochodzenia, nie nazwę fikcyjnej licencji stockowej ani zapewnienie wyłączności praw autorskich. Nie są to fotografie użytkowników, skany ciała ani certyfikowane modele medyczne.

## Podłączone pliki

- `public/body-models/male-front.webp`
- `public/body-models/male-back.webp`
- `public/body-models/female-front.webp`
- `public/body-models/female-back.webp`

Wszystkie: 1024×1536, pełna postać, ortogonalny widok, wspólny ciemny kadr, stopy około 92% wysokości, podobna skala, naturalne proporcje i sportowe szorty. Kobieca para ma sportowy top. PNG z generatora przekonwertowano bez kadrowania do WebP quality 88 przy użyciu Sharp; łącznie około 214 kB. Punkty dopasowano osobno do wariantów w `bodyModelAdapter.js`; anatomiczne L/P są odwrócone w widoku przodu. Brak deformacji lub wyprowadzania budowy z pomiarów.

Neutralny zachowuje zapis `bodyProfile.model=neutral`, ale pokazuje opisany panel punktów i wartości bez postaci. Nie podstawia po cichu męskiej ilustracji. W razie błędu pobrania obrazu również pozostają dostępne prawdziwe dane i punkty.

## Prompty użyte do finalnych obrazów

### Mężczyzna — tył

Production asset for fitness measurement app: full length professional realistic illustration of an adult male athlete seen from the rear, standing straight with arms slightly away from torso, relaxed hands, wearing opaque charcoal mid-thigh sports training shorts. Nonsexual athletic posture. Natural average fit build, subtle back muscle definition, short brown hair, bare feet. Centered orthographic view, black charcoal #101416 studio background, soft even studio light, no text, no watermark. Portrait 1024x1536, crown y3%, soles y92%, body centered x50%, waist y42%, hips y50%, knees y66%. Entire figure fully visible, no cropping, no exaggerated muscles. High quality natural fitness illustration for an interactive progress tracker.

### Mężczyzna — przód (edycja własnego wygenerowanego mastera)

Use case: precise-object-edit. Image 1 is edit target, image 2 supporting wardrobe and pose reference. Make image 1 wear the same opaque loose charcoal mid-thigh athletic training shorts as image 2. Bring arms slightly closer to torso matching image 2's arm angle, keeping separation. Preserve front view, natural anatomy, skin, face, lighting, centered figure and full length framing. Same 1024x1536 canvas and scale, crown near y2%, soles y93%, standing straight, bare feet. Neutral nonsexual sports training illustration for a body measurement tracker. Keep same dark studio background, no text, no labels. Final matching front and back athletic apparel set.

Master docelowy edycji również powstał wyłącznie w tym zadaniu:

Use case: stylized-concept. Production fitness app asset, not UI mockup. Create a premium natural anatomical fitness illustration of an adult man, full body FRONT view, relaxed anatomical A pose, arms separated slightly from waist, palms forward, feet hip width. Natural balanced athletic proportions, realistic skin with subtle muscle definition, NOT bodybuilder, no exposed internal anatomy. Matte charcoal fitted short training briefs, bare torso, barefoot. Neutral light warm gray skin, soft professional studio lighting, subtle sculptural realism. Flat solid background #101416, no floor shadow, no text, no watermark, no props. Portrait canvas 1024x1536. Entire body centered x=50%, crown y=5%, soles y=95%; shoulders y=23%, chest y=31%, waist y=43%, hips y=52%, mid biceps y=33%, mid thigh y=66%, calf y=81%. Straight orthographic camera at body center, no perspective distortion, no dramatic pose. This will be the master reference for a matching rear view and female pair. High quality final usable app illustration, calm sophisticated premium aesthetic.

### Kobieta — przód (referencja stylu: własny męski tył)

Use case: stylized-concept. Reference image provides style, lighting, framing and scale for an original fitness measurement app. Generate a matching ADULT FEMALE athlete FRONT view, fully dressed in an opaque charcoal sports bra and opaque charcoal mid-thigh fitted training shorts, bare feet. Natural healthy average athletic proportions, not exaggerated, neutral standing stance with arms slightly away from torso. No sexualized pose. Neutral professional fitness illustration. Orthographic front view, eyes forward, brown hair tied neatly above neck. Same 1024x1536 portrait canvas, body centered x50%, crown y2%, soles y93%, waist near y41%, knees y67%. Same soft even studio lighting, dark charcoal background, realistic subtle anatomy and skin. Entire figure visible, no labels, no text, no watermark. This is final production asset for tracking actual measurements; preserve consistent scale and professional style with reference.

### Kobieta — tył (referencja: własny kobiecy przód)

Use case: identity-preserve. Reference is front master illustration for a fitness app measurement tracker. Generate the matching BACK view of the same adult woman in the same opaque charcoal sports bra and mid-thigh athletic training shorts, same tied up brown hair and skin. Rear orthographic view standing straight, arms slightly away from torso same relaxed angle as reference, feet hip width. Neutral professional athletic nonsexual depiction, natural anatomy. Preserve EXACT canvas 1024x1536, scale, centered body, crown y2%, soles y93%, shoulder waist knee heights matching the front reference. Same subtle studio light and dark #101416 background. Entire figure visible, no labels, no text, no watermark, no props. Final production static sports illustration.

Generator nie gwarantuje matematycznie identycznej geometrii. Cztery wyniki obejrzano i podłączono we wspólnym canvasie bez rozciągania; hotspoty kalibruje wariant, a nie wartości pomiarów. Sumy kontrolne finalnych WebP są zapisane w `body-assets-manifest.json`.

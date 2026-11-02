import { useId } from "react";

// Original code-native illustration. Swap through bodyModelRegistry when final assets are approved.
export function BodySilhouette({ model, view }) {
  const id = useId().replaceAll(":", "");
  const female = model === "female", back = view === "back";
  const outline = female
    ? "M148 68 L147 80 Q119 81 110 99 L94 146 L77 214 Q75 228 83 233 Q90 236 95 222 L114 166 L125 132 Q132 161 126 182 L117 217 Q108 243 119 269 L129 325 L130 383 L126 460 Q125 471 137 471 L149 467 L154 397 L159 324 L160 280 L161 324 L166 397 L171 467 L183 471 Q195 471 194 460 L190 383 L191 325 L201 269 Q212 243 203 217 L194 182 Q188 161 195 132 L206 166 L225 222 Q230 236 237 233 Q245 228 243 214 L226 146 L210 99 Q201 81 173 80 L172 68 Z"
    : "M146 68 L144 79 Q114 80 102 94 L86 141 L72 213 Q69 227 78 232 Q87 234 92 219 L110 159 L121 127 L126 177 L119 221 L124 269 L131 326 L130 388 L126 460 Q125 471 138 471 L150 468 L156 394 L159 325 L160 280 L161 325 L164 394 L170 468 L182 471 Q195 471 194 460 L190 388 L189 326 L196 269 L201 221 L194 177 L199 127 L210 159 L228 219 Q233 234 242 232 Q251 227 248 213 L234 141 L218 94 Q206 80 176 79 L174 68 Z";
  return <svg className="body-silhouette" viewBox="0 0 320 500" role="img" aria-label={`Schemat ${female ? "kobiecy" : "męski"} — ${back ? "tył" : "przód"}`}>
    <defs><linearGradient id={`${id}-fill`} x1="0" x2="1"><stop stopColor="#303936"/><stop offset=".45" stopColor="#89958c"/><stop offset=".56" stopColor="#717f76"/><stop offset="1" stopColor="#27322e"/></linearGradient><radialGradient id={`${id}-light`}><stop stopColor="var(--accent)" stopOpacity=".11"/><stop offset="1" stopColor="var(--accent)" stopOpacity="0"/></radialGradient></defs>
    <ellipse cx="160" cy="250" rx="147" ry="244" fill={`url(#${id}-light)`}/>
    <ellipse cx="160" cy="479" rx="60" ry="5" fill="#000" opacity=".5"/>
    <g fill={`url(#${id}-fill)`} stroke="#a1afa0" strokeOpacity=".4" strokeWidth="1">
      <ellipse cx="160" cy="43" rx={female ? 20 : 22} ry="29"/>
      <path d={outline}/>
    </g>
    <g fill="none" stroke="#18251e" strokeWidth="1.5" opacity=".55" strokeLinecap="round">
      {back ? <><path d="M160 86 V218 M126 103 Q138 120 150 143 L139 171 M194 103 Q182 120 170 143 L181 171 M131 226 Q144 244 158 240 M189 226 Q176 244 162 240"/><path d="M140 278 L142 353 M180 278 L178 353 M141 389 L139 439 M179 389 L181 439"/></> : <><path d={female ? "M130 120 Q143 140 158 125 M190 120 Q177 140 162 125 M137 174 Q160 187 183 174" : "M124 112 Q143 133 158 114 M196 112 Q177 133 162 114 M160 120 V193 M138 159 Q160 165 182 159 M137 178 Q160 184 183 178"}/><path d="M126 217 Q144 226 155 254 M194 217 Q176 226 165 254 M139 282 L143 353 M181 282 L177 353 M140 392 L138 441 M180 392 L182 441"/></>}
      <path d="M111 153 L91 214 M209 153 L229 214"/>
    </g>
  </svg>;
}

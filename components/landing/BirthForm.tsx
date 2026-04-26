FIND this in your BirthForm.tsx (around line 170):

      const birthData = {
        dob: fields.dateOfBirth,
        tob: fields.unknownTime ? "12:00" : fields.timeOfBirth,
        lat: fields.latitude as number,
        lng: fields.longitude as number,
        cityName: fields.city,
        timezone: fields.timezoneOffset,
        ayanamsa: fields.ayanamsa,
      }

REPLACE with this (only added "name" line):

      const birthData = {
        name: fields.name,
        dob: fields.dateOfBirth,
        tob: fields.unknownTime ? "12:00" : fields.timeOfBirth,
        lat: fields.latitude as number,
        lng: fields.longitude as number,
        cityName: fields.city,
        timezone: fields.timezoneOffset,
        ayanamsa: fields.ayanamsa,
      }

---
ALSO: Hide Ayanamsa field — FIND this block (around line 290):

            {/* 10 — Ayanamsa */}
            <div>
              <label htmlFor="tv-ayanamsa" className="block text-sm font-medium text-slate-300 mb-1.5">
                Ayanamsa
              </label>
              <select
                id="tv-ayanamsa"
                value={fields.ayanamsa}
                onChange={e => set("ayanamsa", e.target.value as BirthFormFields["ayanamsa"])}
                className="w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", colorScheme: "dark" }}
              >
                <option value="lahiri">Lahiri (Chitrapaksha) — Default</option>
                <option value="raman">B.V. Raman</option>
                <option value="krishnamurti">Krishnamurti (KP)</option>
                <option value="yukteshwar">Sri Yukteshwar</option>
              </select>
            </div>

REPLACE with this (hidden, always lahiri):

            {/* 10 — Ayanamsa — hidden, always Lahiri */}
            <input type="hidden" id="tv-ayanamsa" value="lahiri" />
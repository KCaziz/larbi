import { useEffect, useRef, useState } from 'react';
import i18n from 'i18next';
import { api } from './api.js';

// P13-05 (2026-11-25): the official rate of the Banque d'Algérie, proposed by
// default in the import-export and diaspora screens. It only fills an EMPTY
// rate: the person keeps the hand on the rate retained, its date and source.
export function useOfficialRate(from, to, currentRate, apply) {
  const [proposed, setProposed] = useState(false);
  const applyRef = useRef(apply);
  applyRef.current = apply;
  const empty = currentRate === '' || currentRate === null || currentRate === undefined;
  const source = String(from ?? '').trim().toUpperCase();
  const target = String(to ?? '').trim().toUpperCase();

  useEffect(() => {
    if (!/^[A-Z]{3}$/.test(source) || !/^[A-Z]{3}$/.test(target) || source === target || !empty) return undefined;
    let alive = true;
    const query = new URLSearchParams({ from: source, to: target }).toString();
    api
      .get(`/fin/entreprise/cours-officiel?${query}`)
      .then((res) => {
        if (!alive || !res?.cours) return;
        applyRef.current({
          rate: String(res.cours.rate),
          rateDate: res.cours.referenceDate ? String(res.cours.referenceDate).slice(0, 10) : new Date().toISOString().slice(0, 10),
          // R20: the source is chosen in a list; the official one has its own words there.
          rateSource: i18n.t('fields.rateSources.official'),
        });
        setProposed(true);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
    // Only when the pair of currencies changes: a rate typed by the person is never replaced.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, target]);

  return proposed && !empty;
}

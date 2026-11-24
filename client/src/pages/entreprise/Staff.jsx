import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, Check, Clock, GraduationCap, Plus, Star, Trash2, X } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatDate } from '../../lib/format.js';
import { toMinorUnits } from '../../lib/money.js';
import { newIdempotencyKey } from '../../lib/organisation.js';
import Button from '../../components/ui/Button.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';

// P13-05, lot H (2026-11-24): the rest of human resources (ECR-0274 to 0277):
// timesheets approved by another person (approved overtime feeds the payroll),
// skills, training plan, recruitment.

const today = () => new Date().toISOString().slice(0, 10);
const CONTRACTS = ['cdi', 'cdd', 'stage', 'apprenti', 'interim', 'autre'];
const STAGES = ['applied', 'interview', 'offer', 'hired', 'rejected'];

export function StaffSection({ business, can, run }) {
  const { t } = useTranslation();
  const [month, setMonth] = useState(today().slice(0, 7));
  const query = new URLSearchParams({ month }).toString();
  const staff = useApi(`/fin/entreprise/rh?${query}`);
  const manage = can('hr.manage');
  const act = async (action, okKey) => {
    const done = await run(action, okKey);
    if (done) staff.reload();
    return done;
  };
  const data = staff.data;
  if (staff.status === 'loading' && !data) return <LoadingState />;
  if (!data) return null;
  const active = data.salaries.filter((e) => !e.endedAt);

  return (
    <>
      <section aria-labelledby="staff-time">
        <h2 id="staff-time">
          <Clock size={18} aria-hidden="true" /> {t('business.staff.timeTitle')}
        </h2>
        <p className="business-blocked-intro">{t('business.staff.timeIntro')}</p>
        <label className="pilot-inline">
          {t('business.staff.month')}
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </label>
        {data.salaries.length === 0 ? (
          <p className="business-empty">{t('business.staff.noEmployee')}</p>
        ) : (
          <ul className="business-documents">
            {data.salaries.map((e) => (
              <Timesheet key={e.id} employee={e} manage={manage && !e.endedAt} run={act} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="staff-skills">
        <h2 id="staff-skills">
          <Star size={18} aria-hidden="true" /> {t('business.staff.skillsTitle')}
        </h2>
        {active.length === 0 ? (
          <p className="business-empty">{t('business.staff.noEmployee')}</p>
        ) : (
          <ul className="business-documents">
            {active.map((e) => (
              <Skills key={e.id} employee={e} manage={manage} run={act} />
            ))}
          </ul>
        )}
      </section>

      <Trainings business={business} data={data} employees={active} manage={manage} run={act} />
      <Recruitment data={data} manage={manage} run={act} />
    </>
  );
}

function Timesheet({ employee, manage, run }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ workedOn: today(), hours: '8', overtimeHours: '0' });
  const base = `/fin/entreprise/rh/salaries/${employee.id}/temps`;
  return (
    <li className="business-document">
      <div className="business-document-head">
        <strong>{employee.fullName}</strong>
        <span className="inv-muted">{t('business.staff.hoursSummary', { hours: employee.heures.travaillees, overtime: employee.heures.supplementaires })}</span>
        {employee.heures.enAttente > 0 && <span className="business-document-state">{t('business.staff.pending', { n: employee.heures.enAttente })}</span>}
      </div>
      <Button type="button" variant="ghost" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? t('business.staff.hide') : t('business.staff.days', { n: employee.timesheets.length })}
      </Button>
      {open && (
        <div className="trade-details">
          <ul className="trade-pieces">
            {employee.timesheets.map((s) => (
              <li key={s.id} className={`dia-status-${s.status === 'approved' ? 'validated' : s.status === 'submitted' ? 'submitted' : 'rejected'}`}>
                <span>
                  {formatDate(i18n.language, s.workedOn)} · {t('business.staff.hoursOf', { hours: s.hours, overtime: s.overtimeHours })}
                </span>
                <span className="dia-actions">
                  <span className="business-document-state">{t(`business.staff.sheetStatuses.${s.status}`)}</span>
                  {s.peutDecider && (
                    <>
                      <Button type="button" variant="ghost" onClick={() => run(() => api.post(`${base}/${s.id}/approuver`, {}), 'business.staff.saved')}>
                        <Check size={16} aria-hidden="true" />
                        {t('business.staff.approve')}
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => run(() => api.post(`${base}/${s.id}/refuser`, {}), 'business.staff.saved')}>
                        <X size={16} aria-hidden="true" />
                        {t('business.staff.refuse')}
                      </Button>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
          {manage && (
            <form
              className="business-form business-payment"
              onSubmit={(e) => {
                e.preventDefault();
                run(() => api.post(base, { workedOn: form.workedOn, hours: Number(form.hours), overtimeHours: Number(form.overtimeHours || 0) }), 'business.staff.timeRecorded');
              }}
            >
              <label>
                {t('business.staff.day')}
                <input type="date" value={form.workedOn} onChange={(e) => setForm((p) => ({ ...p, workedOn: e.target.value }))} required />
              </label>
              <label>
                {t('business.staff.hours')}
                <input type="number" min="0" max="24" step="0.25" value={form.hours} onChange={(e) => setForm((p) => ({ ...p, hours: e.target.value }))} required />
              </label>
              <label>
                {t('business.staff.overtime')}
                <input type="number" min="0" max="24" step="0.25" value={form.overtimeHours} onChange={(e) => setForm((p) => ({ ...p, overtimeHours: e.target.value }))} />
              </label>
              <Button type="submit" variant="secondary">
                <Plus size={16} aria-hidden="true" />
                {t('business.staff.record')}
              </Button>
            </form>
          )}
        </div>
      )}
    </li>
  );
}

function Skills({ employee, manage, run }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ skill: '', level: '2' });
  const base = `/fin/entreprise/rh/salaries/${employee.id}/competences`;
  return (
    <li className="business-document">
      <div className="business-document-head">
        <strong>{employee.fullName}</strong>
        <span className="inv-muted">{employee.position}</span>
      </div>
      {employee.skills.length > 0 && (
        <ul className="trade-pieces">
          {employee.skills.map((s) => (
            <li key={s.id}>
              <span>
                {s.skill} · {t(`business.staff.levels.${s.level}`)}
              </span>
              {manage && (
                <Button type="button" variant="ghost" aria-label={t('business.staff.removeSkill', { skill: s.skill })} onClick={() => run(() => api.delete(`${base}/${s.id}`), 'business.staff.saved')}>
                  <Trash2 size={16} aria-hidden="true" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {manage && (
        <form
          className="business-form business-payment"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await run(() => api.post(base, { skill: form.skill.trim(), level: Number(form.level) }), 'business.staff.saved')) setForm((p) => ({ ...p, skill: '' }));
          }}
        >
          <label>
            {t('business.staff.skill')}
            <input value={form.skill} onChange={(e) => setForm((p) => ({ ...p, skill: e.target.value }))} maxLength={120} required />
          </label>
          <label>
            {t('business.staff.level')}
            <select value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}>
              {[1, 2, 3, 4].map((l) => (
                <option key={l} value={l}>
                  {t(`business.staff.levels.${l}`)}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" variant="secondary">
            {t('business.staff.assess')}
          </Button>
        </form>
      )}
    </li>
  );
}

function Trainings({ business, data, employees, manage, run }) {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({ title: '', provider: '', employeeId: '', plannedAt: today(), cost: '' });
  const [key, setKey] = useState(newIdempotencyKey);
  const amounts = data.budgetFormation !== null;
  return (
    <section aria-labelledby="staff-training">
      <h2 id="staff-training">
        <GraduationCap size={18} aria-hidden="true" /> {t('business.staff.trainingTitle')}
      </h2>
      {amounts && <p className="inv-muted inv-note">{t('business.staff.trainingBudget', { amount: formatAmount(i18n.language, data.budgetFormation, business.currency) })}</p>}
      {manage && (
        <form
          className="business-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const body = {
              title: form.title.trim(),
              plannedAt: form.plannedAt,
              ...(form.provider.trim() ? { provider: form.provider.trim() } : {}),
              ...(form.employeeId ? { employeeId: form.employeeId } : {}),
              ...(amounts && form.cost ? { cost: toMinorUnits(form.cost, business.currency, { allowZero: true }) } : {}),
            };
            if (await run(() => api.post('/fin/entreprise/rh/formations', body, { idempotencyKey: key }), 'business.staff.trainingPlanned')) {
              setKey(newIdempotencyKey());
              setForm((p) => ({ ...p, title: '', provider: '', cost: '' }));
            }
          }}
        >
          <div className="business-form-row">
            <label>
              {t('business.staff.trainingName')}
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} maxLength={160} required />
            </label>
            <label>
              {t('business.staff.provider')}
              <input value={form.provider} onChange={(e) => setForm((p) => ({ ...p, provider: e.target.value }))} maxLength={160} />
            </label>
            <label>
              {t('business.staff.forWhom')}
              <select value={form.employeeId} onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))}>
                <option value="">{t('business.staff.everyone')}</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.fullName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('business.staff.plannedAt')}
              <input type="date" value={form.plannedAt} onChange={(e) => setForm((p) => ({ ...p, plannedAt: e.target.value }))} required />
            </label>
            {amounts && <AmountField id="training-cost" label={t('business.staff.cost')} currency={business.currency} value={form.cost} onChange={(v) => setForm((p) => ({ ...p, cost: v }))} />}
          </div>
          <Button type="submit" variant="secondary">
            <Plus size={16} aria-hidden="true" />
            {t('business.staff.planTraining')}
          </Button>
        </form>
      )}
      {data.formations.length === 0 ? (
        <p className="business-empty">{t('business.staff.noTraining')}</p>
      ) : (
        <ul className="trade-pieces">
          {data.formations.map((f) => (
            <li key={f.id} className={`dia-status-${f.status === 'done' ? 'validated' : f.status === 'planned' ? 'submitted' : 'rejected'}`}>
              <span>
                {f.title} · {f.salarie ?? t('business.staff.everyone')} · {formatDate(i18n.language, f.plannedAt)}
                {f.cost !== undefined && f.cost !== null ? ` · ${formatAmount(i18n.language, f.cost, business.currency)}` : ''}
              </span>
              <span className="dia-actions">
                <span className="business-document-state">{t(`business.staff.trainingStatuses.${f.status}`)}</span>
                {manage && f.status === 'planned' && (
                  <>
                    <Button type="button" variant="ghost" onClick={() => run(() => api.put(`/fin/entreprise/rh/formations/${f.id}`, { status: 'done' }), 'business.staff.saved')}>
                      <Check size={16} aria-hidden="true" />
                      {t('business.staff.markDone')}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => run(() => api.put(`/fin/entreprise/rh/formations/${f.id}`, { status: 'cancelled' }), 'business.staff.saved')}>
                      <X size={16} aria-hidden="true" />
                      {t('business.staff.cancel')}
                    </Button>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Recruitment({ data, manage, run }) {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({ title: '', department: '', contract: 'cdi', openedAt: today() });
  const [key, setKey] = useState(newIdempotencyKey);
  return (
    <section aria-labelledby="staff-recruitment">
      <h2 id="staff-recruitment">
        <Briefcase size={18} aria-hidden="true" /> {t('business.staff.recruitmentTitle')}
      </h2>
      <p className="business-blocked-intro">{t('business.staff.recruitmentIntro')}</p>
      {manage && (
        <form
          className="business-form business-payment"
          onSubmit={async (e) => {
            e.preventDefault();
            const body = { title: form.title.trim(), contract: form.contract, openedAt: form.openedAt, ...(form.department.trim() ? { department: form.department.trim() } : {}) };
            if (await run(() => api.post('/fin/entreprise/rh/postes', body, { idempotencyKey: key }), 'business.staff.vacancyOpened')) {
              setKey(newIdempotencyKey());
              setForm((p) => ({ ...p, title: '', department: '' }));
            }
          }}
        >
          <label>
            {t('business.staff.vacancy')}
            <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} maxLength={160} required />
          </label>
          <label>
            {t('business.staff.department')}
            <input value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} maxLength={120} />
          </label>
          <label>
            {t('business.staff.contract')}
            <select value={form.contract} onChange={(e) => setForm((p) => ({ ...p, contract: e.target.value }))}>
              {CONTRACTS.map((c) => (
                <option key={c} value={c}>
                  {t(`business.g.contracts.${c}`)}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" variant="secondary">
            <Plus size={16} aria-hidden="true" />
            {t('business.staff.openVacancy')}
          </Button>
        </form>
      )}
      {data.postes.length === 0 ? (
        <p className="business-empty">{t('business.staff.noVacancy')}</p>
      ) : (
        <ul className="business-documents">
          {data.postes.map((v) => (
            <Vacancy key={v.id} vacancy={v} manage={manage} run={run} lang={i18n.language} />
          ))}
        </ul>
      )}
    </section>
  );
}

function Vacancy({ vacancy, manage, run, lang }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [key, setKey] = useState(newIdempotencyKey);
  const base = `/fin/entreprise/rh/postes/${vacancy.id}`;
  return (
    <li className="business-document">
      <div className="business-document-head">
        <strong>{vacancy.title}</strong>
        {vacancy.department && <span className="inv-muted">{vacancy.department}</span>}
        <span className="inv-badge">{t(`business.g.contracts.${vacancy.contract}`)}</span>
        <span className="inv-muted">{formatDate(lang, vacancy.openedAt)}</span>
        <span className="business-document-state">{t(`business.staff.vacancyStatuses.${vacancy.status}`)}</span>
      </div>
      {vacancy.candidates.length > 0 && (
        <ul className="trade-pieces">
          {vacancy.candidates.map((c) => (
            <li key={c.id}>
              <span>{c.fullName}</span>
              <span className="dia-actions">
                {manage ? (
                  <select aria-label={t('business.staff.stageOf', { name: c.fullName })} value={c.stage} onChange={(e) => run(() => api.put(`${base}/candidats/${c.id}`, { stage: e.target.value }), 'business.staff.saved')}>
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {t(`business.staff.stages.${s}`)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="business-document-state">{t(`business.staff.stages.${c.stage}`)}</span>
                )}
                {manage && (
                  <Button type="button" variant="ghost" aria-label={t('business.staff.removeCandidate', { name: c.fullName })} onClick={() => window.confirm(t('business.staff.removeConfirm')) && run(() => api.delete(`${base}/candidats/${c.id}`), 'business.staff.saved')}>
                    <Trash2 size={16} aria-hidden="true" />
                  </Button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      {manage && vacancy.status === 'open' && (
        <div className="inv-actions">
          <form
            className="business-form business-payment"
            onSubmit={async (e) => {
              e.preventDefault();
              if (await run(() => api.post(`${base}/candidats`, { fullName: name.trim() }, { idempotencyKey: key }), 'business.staff.candidateAdded')) {
                setKey(newIdempotencyKey());
                setName('');
              }
            }}
          >
            <label>
              {t('business.staff.candidate')}
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={160} required />
            </label>
            <Button type="submit" variant="secondary">
              <Plus size={16} aria-hidden="true" />
              {t('business.staff.addCandidate')}
            </Button>
          </form>
          <Button type="button" variant="ghost" onClick={() => run(() => api.put(base, { status: 'cancelled' }), 'business.staff.saved')}>
            {t('business.staff.closeVacancy')}
          </Button>
        </div>
      )}
    </li>
  );
}

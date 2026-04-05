import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { families, partners, investors, getUserRole, getPartnerId } from '../lib/api';

// ── Styles ────────────────────────────────────────────────────────────────────

const sectionHead = {
  fontFamily: 'var(--display-font)',
  fontSize: '22px',
  fontWeight: 600,
  color: 'var(--green)',
};

const tabLabel = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  color: 'var(--gold)',
  fontWeight: 600,
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1.5px solid var(--border)',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: 'var(--body-font)',
  color: 'var(--charcoal)',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};

const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  cursor: 'pointer',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a9e96' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '32px',
};

function Label({ children }) {
  return <div style={{ ...tabLabel, fontSize: '10px', marginBottom: '6px' }}>{children}</div>;
}

function formatINR(val) {
  const n = parseFloat(val) || 0;
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)} K`;
  return `₹${n.toFixed(0)}`;
}

// ── Skeleton row ──────────────────────────────────────────────────────────────

function SkeletonRow() {
  const shimmer = {
    background: 'linear-gradient(90deg, var(--sage) 25%, #e8ede8 50%, var(--sage) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: '4px',
    height: '14px',
  };
  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      {[160, 140, 60, 100, 120, 80].map((w, i) => (
        <td key={i} style={{ padding: '16px 20px' }}><div style={{ ...shimmer, width: w }} /></td>
      ))}
    </tr>
  );
}

// ── Member Picker ─────────────────────────────────────────────────────────────
// partnerInvestors: [{ id, first_name, last_name }]
// selected: [{ id, first_name, last_name }]
// onChange: (newSelected) => void

function MemberPicker({ partnerInvestors, selected, onChange, disabled }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const selectedIds = new Set(selected.map(m => m.id));

  const filtered = partnerInvestors.filter(inv => {
    if (selectedIds.has(inv.id)) return false;
    if (!query.trim()) return true;
    const name = `${inv.first_name} ${inv.last_name || ''}`.toLowerCase();
    return name.includes(query.toLowerCase());
  });

  const addMember = (inv) => {
    onChange([...selected, inv]);
    setQuery('');
    inputRef.current?.focus();
  };

  const removeMember = (id) => {
    onChange(selected.filter(m => m.id !== id));
  };

  return (
    <div>
      {/* Chips */}
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
          {selected.map(m => (
            <span key={m.id} style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 10px', borderRadius: '100px',
              background: 'rgba(44,74,62,0.08)', border: '1px solid rgba(44,74,62,0.15)',
              fontSize: '12px', fontWeight: 500, color: 'var(--green)',
            }}>
              {m.first_name} {m.last_name || ''}
              {!disabled && (
                <button
                  onClick={() => removeMember(m.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a9e96', fontSize: '14px', lineHeight: 1, padding: '0 2px' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#c0392b'}
                  onMouseLeave={e => e.currentTarget.style.color = '#8a9e96'}
                >✕</button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      {!disabled && (
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={partnerInvestors.length === 0 ? 'No investors for this partner' : 'Search investors to add…'}
          disabled={partnerInvestors.length === 0}
          style={{
            ...inputStyle,
            background: partnerInvestors.length === 0 ? 'var(--sage)' : '#fff',
            cursor: partnerInvestors.length === 0 ? 'not-allowed' : 'text',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--green)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      )}

      {/* Dropdown results */}
      {!disabled && query.trim() && (
        <div style={{
          border: '1px solid var(--border)', borderRadius: '8px',
          marginTop: '4px', background: '#fff',
          boxShadow: '0 4px 16px rgba(44,74,62,0.08)',
          maxHeight: '180px', overflowY: 'auto',
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '12px 14px', fontSize: '13px', color: '#9aaa9e' }}>
              {query ? 'No matching investors' : 'All investors already added'}
            </div>
          ) : filtered.map(inv => (
            <div
              key={inv.id}
              onMouseDown={() => addMember(inv)}
              style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '13px', color: 'var(--charcoal)', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              {inv.first_name} {inv.last_name || ''}
              {inv.pan && <span style={{ color: '#9aaa9e', marginLeft: '8px', fontSize: '11px', fontFamily: 'monospace' }}>{inv.pan.slice(0,3)}••••{inv.pan.slice(-2)}</span>}
            </div>
          ))}
        </div>
      )}

      {/* No investors warning */}
      {!disabled && partnerInvestors.length === 0 && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--gold)', fontWeight: 500 }}>
          This partner has no investors yet — create investors first.
        </div>
      )}
    </div>
  );
}

const subSections = ['Family List', 'Create Family'];

// ── Edit / Delete Drawer ──────────────────────────────────────────────────────

function FamilyDrawer({ family, livePartners, onClose, onSaved, isPartner }) {
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [partnerInvestors, setPartnerInvestors] = useState([]);
  const [originalMemberIds, setOriginalMemberIds] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [headId, setHeadId] = useState('');
  const [familyName, setFamilyName] = useState(family.name || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load full family detail + partner investors on mount
  useEffect(() => {
    async function load() {
      setLoadingDetail(true);
      try {
        const [detail, invData] = await Promise.all([
          families.get(family.id),
          investors.list({ partner_id: family.partner_id, limit: 200 }),
        ]);
        const members = (detail.members || []).map(m => ({
          id: m.id, first_name: m.first_name, last_name: m.last_name, pan: m.pan,
        }));
        setSelectedMembers(members);
        setOriginalMemberIds(members.map(m => m.id));
        setHeadId(detail.head_investor_id ? String(detail.head_investor_id) : '');
        // Exclude investors already in OTHER families (keep those in THIS family)
        const currentMemberIds = new Set((detail.members || []).map(m => m.id));
        setPartnerInvestors(
          (invData?.investors || [])
            .filter(i => !i.family_id || currentMemberIds.has(i.id))
            .map(i => ({ id: i.id, first_name: i.first_name, last_name: i.last_name, pan: i.pan }))
        );
      } catch (e) {
        setError('Failed to load family details.');
      } finally {
        setLoadingDetail(false);
      }
    }
    load();
  }, [family.id, family.partner_id]);

  const handleSave = async () => {
    if (!familyName.trim()) { setError('Family name is required.'); return; }
    if (selectedMembers.length === 0) { setError('At least one member is required.'); return; }
    if (!headId) { setError('Head investor is required.'); return; }

    const newIds = selectedMembers.map(m => m.id);
    const add_members = newIds.filter(id => !originalMemberIds.includes(id));
    const remove_members = originalMemberIds.filter(id => !newIds.includes(id));

    setSubmitting(true); setError('');
    try {
      await families.update(family.id, {
        name: familyName.trim(),
        head_investor_id: parseInt(headId),
        add_members,
        remove_members,
      });
      setSaved(true);
      onSaved();
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await families.delete(family.id);
      onSaved();
    } catch (e) {
      setError(e.message || 'Failed to delete family.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  // Auto-suggest family name when head changes
  const prevHeadRef = useRef('');
  useEffect(() => {
    if (!headId) return;
    const inv = selectedMembers.find(m => String(m.id) === headId);
    if (!inv) return;
    const suggested = inv.last_name ? `${inv.last_name} Family` : `${inv.first_name} Family`;
    // Only auto-update if name is empty or was auto-suggested from previous head
    if (!familyName || familyName === prevHeadRef.current) {
      setFamilyName(suggested);
    }
    prevHeadRef.current = suggested;
  }, [headId]);

  // If head investor is no longer in members, clear it
  useEffect(() => {
    if (headId && !selectedMembers.find(m => String(m.id) === headId)) {
      setHeadId('');
    }
  }, [selectedMembers]);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,43,37,0.4)', zIndex: 200 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '500px', background: '#fff', zIndex: 201, overflowY: 'auto', boxShadow: '-8px 0 40px rgba(44,74,62,0.12)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={sectionHead}>Edit Family</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#8a9e96' }}>✕</button>
        </div>

        <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {loadingDetail ? (
            <div style={{ fontSize: '13px', color: '#9aaa9e' }}>Loading…</div>
          ) : (
            <>
              {/* Partner — read-only */}
              {!isPartner && (
                <div>
                  <Label>Partner</Label>
                  <input
                    value={family.partner_name || '—'}
                    disabled
                    style={{ ...inputStyle, background: 'var(--sage)', color: '#8a9e96', cursor: 'not-allowed' }}
                  />
                </div>
              )}

              {/* Members */}
              <div>
                <Label>Members</Label>
                <MemberPicker
                  partnerInvestors={partnerInvestors}
                  selected={selectedMembers}
                  onChange={setSelectedMembers}
                />
              </div>

              {/* Head Investor */}
              <div>
                <Label>Head Investor</Label>
                <select
                  value={headId}
                  onChange={e => setHeadId(e.target.value)}
                  disabled={selectedMembers.length === 0}
                  style={{
                    ...selectStyle,
                    background: selectedMembers.length === 0 ? 'var(--sage)' : '#fff',
                    color: selectedMembers.length === 0 ? '#8a9e96' : 'var(--charcoal)',
                    cursor: selectedMembers.length === 0 ? 'not-allowed' : 'pointer',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                >
                  <option value="">— Select members first</option>
                  {selectedMembers.map(m => (
                    <option key={m.id} value={String(m.id)}>{m.first_name} {m.last_name || ''}</option>
                  ))}
                </select>
              </div>

              {/* Family Name */}
              <div>
                <Label>Family Name</Label>
                <input
                  value={familyName}
                  onChange={e => { setFamilyName(e.target.value); prevHeadRef.current = ''; }}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {error && (
                <div style={{ fontSize: '13px', color: '#c0392b', padding: '10px 14px', background: 'rgba(192,57,43,0.06)', borderRadius: '8px' }}>
                  {error}
                </div>
              )}

              {/* Delete section */}
              {!confirmDelete ? (
                <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    style={{ fontSize: '13px', color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', textDecoration: 'underline' }}
                  >
                    Delete this family
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: 'auto', padding: '16px', borderRadius: '10px', background: 'rgba(192,57,43,0.05)', border: '1px solid rgba(192,57,43,0.15)' }}>
                  <div style={{ fontSize: '13px', color: '#c0392b', fontWeight: 500, marginBottom: '6px' }}>Delete this family?</div>
                  <div style={{ fontSize: '12px', color: '#8a9e96', marginBottom: '14px', lineHeight: 1.6 }}>
                    The family will be removed. All members will be unlinked but not deleted.
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      style={{ padding: '8px 16px', borderRadius: '7px', background: '#c0392b', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 500, cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1 }}
                    >
                      {deleting ? 'Deleting…' : 'Yes, delete'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      style={{ padding: '8px 16px', borderRadius: '7px', background: '#fff', color: '#8a9e96', border: '1.5px solid var(--border)', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ padding: '20px 28px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
          <button
            onClick={handleSave}
            disabled={submitting || loadingDetail}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--green)', color: 'var(--ivory)', border: 'none', fontSize: '13px', fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = 'var(--gold)'; }}
            onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = 'var(--green)'; }}
          >
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
          <button onClick={onClose} style={{ padding: '12px 20px', borderRadius: '8px', background: 'transparent', color: '#8a9e96', border: '1.5px solid var(--border)', fontSize: '13px', cursor: 'pointer' }}>
            Cancel
          </button>
          {saved && <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500 }}>✓ Saved</span>}
        </div>
      </div>
    </>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  partner_id: '',
  selectedMembers: [],   // [{ id, first_name, last_name, pan }]
  head_investor_id: '',
  name: '',
};

export default function AdminFamilies() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('Family List');

  // List state
  const [familyList, setFamilyList]     = useState([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [partnerFilter, setPartnerFilter] = useState('');
  const [editingFamily, setEditingFamily] = useState(null);

  // Shared
  const [livePartners, setLivePartners] = useState([]);

  // Create form
  const [form, setForm]                     = useState({ ...EMPTY_FORM });
  const [partnerInvestors, setPartnerInvestors] = useState([]);
  const [loadingInvestors, setLoadingInvestors] = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [createError, setCreateError]       = useState('');
  const [successMsg, setSuccessMsg]         = useState('');

  // Track auto-suggested name for Create form
  const prevSuggestedRef = useRef('');

  const isPartner = getUserRole() === 'partner';

  // ── Load live partners ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isPartner) return;
    partners.list()
      .then(data => setLivePartners((Array.isArray(data) ? data : []).filter(p => p.status === 'live')))
      .catch(() => {});
  }, [isPartner]);

  // ── Load family list ────────────────────────────────────────────────────────
  const loadFamilies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await families.list({
        search:     search        || undefined,
        partner_id: partnerFilter || undefined,
        limit: 50, offset: 0,
      });
      setFamilyList(data?.families || []);
      setTotal(data?.total || 0);
    } catch (e) {
      console.error('Failed to load families:', e);
    } finally {
      setLoading(false);
    }
  }, [search, partnerFilter]);

  useEffect(() => { loadFamilies(); }, [loadFamilies]);

  // ── Load investors when partner changes in Create form ──────────────────────
  useEffect(() => {
    const pid = isPartner ? getPartnerId() : form.partner_id;
    if (!pid) {
      setPartnerInvestors([]);
      if (!isPartner) setForm(f => ({ ...f, selectedMembers: [], head_investor_id: '', name: '' }));
      prevSuggestedRef.current = '';
      return;
    }
    setLoadingInvestors(true);
    investors.list({ partner_id: pid, limit: 200 })
      .then(data => setPartnerInvestors(
        (data?.investors || [])
          .filter(i => !i.family_id)
          .map(i => ({ id: i.id, first_name: i.first_name, last_name: i.last_name, pan: i.pan }))
      ))
      .catch(() => setPartnerInvestors([]))
      .finally(() => setLoadingInvestors(false));
    if (!isPartner) {
      setForm(f => ({ ...f, selectedMembers: [], head_investor_id: '', name: '' }));
      prevSuggestedRef.current = '';
    }
  }, [form.partner_id, isPartner]);

  // ── Auto-suggest family name when head changes in Create form ───────────────
  useEffect(() => {
    if (!form.head_investor_id) return;
    const inv = form.selectedMembers.find(m => String(m.id) === form.head_investor_id);
    if (!inv) return;
    const suggested = inv.last_name ? `${inv.last_name} Family` : `${inv.first_name} Family`;
    if (!form.name || form.name === prevSuggestedRef.current) {
      setForm(f => ({ ...f, name: suggested }));
    }
    prevSuggestedRef.current = suggested;
  }, [form.head_investor_id]);

  // ── If head is removed from members, clear head ─────────────────────────────
  useEffect(() => {
    if (form.head_investor_id && !form.selectedMembers.find(m => String(m.id) === form.head_investor_id)) {
      setForm(f => ({ ...f, head_investor_id: '' }));
    }
  }, [form.selectedMembers]);

  const updateForm = (k, v) => { setForm(f => ({ ...f, [k]: v })); setCreateError(''); };

  // ── Create family ───────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!isPartner && !form.partner_id)       { setCreateError('Please select a partner.'); return; }
    if (form.selectedMembers.length === 0)   { setCreateError('Please add at least one member.'); return; }
    if (!form.head_investor_id)              { setCreateError('Please select a head investor.'); return; }
    if (!form.name.trim())                   { setCreateError('Family name is required.'); return; }

    setSubmitting(true); setCreateError('');
    try {
      await families.create({
        name:             form.name.trim(),
        partner_id:       parseInt(form.partner_id),
        head_investor_id: parseInt(form.head_investor_id),
        member_ids:       form.selectedMembers.map(m => m.id),
      });
      setForm({ ...EMPTY_FORM });
      setPartnerInvestors([]);
      prevSuggestedRef.current = '';
      setSuccessMsg('Family created successfully!');
      setTimeout(() => setSuccessMsg(''), 5000);
      setActiveSection('Family List');
      loadFamilies();
    } catch (e) {
      setCreateError(e.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const fi = { onFocus: e => e.target.style.borderColor = 'var(--green)', onBlur: e => e.target.style.borderColor = 'var(--border)' };

  const canSubmit = (isPartner || form.partner_id) && form.selectedMembers.length > 0 && form.head_investor_id && form.name.trim();

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Family Management
        </h1>
      </div>

      {successMsg && (
        <div style={{ marginBottom: '20px', padding: '14px 20px', borderRadius: '10px', background: 'rgba(44,74,62,0.08)', border: '1px solid rgba(44,74,62,0.2)', fontSize: '14px', color: 'var(--green)', fontWeight: 500 }}>
          ✓ {successMsg}
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

        {/* ── Sidebar ── */}
        <div style={{ width: '200px', flexShrink: 0, background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden', position: 'sticky', top: '20px' }}>
          {subSections.map(s => (
            <div key={s} onClick={() => setActiveSection(s)}
              style={{ padding: '14px 18px', cursor: 'pointer', fontSize: '13px', fontWeight: activeSection === s ? 600 : 500, color: activeSection === s ? 'var(--green)' : 'var(--charcoal)', background: activeSection === s ? 'rgba(44,74,62,0.06)' : '#fff', borderLeft: `3px solid ${activeSection === s ? 'var(--green)' : 'transparent'}`, borderBottom: '1px solid var(--border)', transition: 'all 0.15s' }}
              onMouseEnter={e => { if (activeSection !== s) e.currentTarget.style.background = 'var(--sage)'; }}
              onMouseLeave={e => { if (activeSection !== s) e.currentTarget.style.background = '#fff'; }}
            >{s}</div>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ── Family List ── */}
          {activeSection === 'Family List' && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
              {/* Header + filters */}
              <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ ...sectionHead, fontSize: '18px', marginRight: 'auto' }}>All Families</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search families…"
                  style={{ ...inputStyle, width: '200px', padding: '8px 14px', fontSize: '13px' }}
                  {...fi}
                />
                {!isPartner && (
                  <select
                    value={partnerFilter}
                    onChange={e => setPartnerFilter(e.target.value)}
                    style={{ ...selectStyle, width: '160px', padding: '8px 14px', fontSize: '13px' }}
                    onFocus={e => e.target.style.borderColor = 'var(--green)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  >
                    <option value="">All Partners</option>
                    {livePartners.map(p => <option key={p.id} value={String(p.id)}>{p.fname} {p.lname}</option>)}
                  </select>
                )}
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ background: 'var(--sage)' }}>
                      {['Family Name', 'Head Investor', 'Members', 'AUM', ...(!isPartner ? ['Partner'] : []), 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 20px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                    ) : familyList.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: '60px 24px', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--display-font)', fontSize: '22px', color: 'var(--green)', marginBottom: '8px' }}>
                          {search || partnerFilter ? 'No results match your filters.' : 'No families yet'}
                        </div>
                        {!search && !partnerFilter && (
                          <div style={{ fontSize: '13px', color: '#8a9e96' }}>Create your first family using the form.</div>
                        )}
                      </td></tr>
                    ) : familyList.map(f => (
                      <tr key={f.id}
                        style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                      >
                        <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 500, color: 'var(--charcoal)' }}>{f.name}</td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--charcoal)' }}>{f.head_investor_name || '—'}</td>
                        <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '15px', color: 'var(--charcoal)' }}>{f.member_count ?? '—'}</td>
                        <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '15px', color: 'var(--charcoal)' }}>
                          {parseFloat(f.aum) > 0 ? formatINR(f.aum) : '—'}
                        </td>
                        {!isPartner && <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--charcoal)' }}>{f.partner_name || '—'}</td>}
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => navigate(`/families/${f.id}`)}
                              style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', border: '1.5px solid var(--border)', background: '#fff', color: 'var(--charcoal)', cursor: 'pointer' }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--charcoal)'; }}
                            >View</button>
                            <button
                              onClick={() => setEditingFamily(f)}
                              style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', border: '1.5px solid var(--border)', background: '#fff', color: 'var(--charcoal)', cursor: 'pointer' }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--charcoal)'; }}
                            >Edit</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {total > 0 && (
                <div style={{ padding: '14px 28px', borderTop: '1px solid var(--border)', fontSize: '13px', color: '#8a9e96' }}>
                  Showing {familyList.length} of {total} families
                </div>
              )}
            </div>
          )}

          {/* ── Create Family ── */}
          {activeSection === 'Create Family' && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '28px', maxWidth: '560px' }}>
              <span style={{ ...sectionHead, display: 'block', marginBottom: '24px' }}>Create Family</span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Step 1 — Partner */}
                {!isPartner && <div>
                  <Label>Partner *</Label>
                  <select
                    value={form.partner_id}
                    onChange={e => updateForm('partner_id', e.target.value)}
                    style={selectStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--green)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  >
                    <option value="">— Select a partner</option>
                    {livePartners.map(p => <option key={p.id} value={String(p.id)}>{p.fname} {p.lname}</option>)}
                  </select>
                </div>}

                {/* Step 2 — Members */}
                <div style={{ opacity: (isPartner || form.partner_id) ? 1 : 0.45, pointerEvents: (isPartner || form.partner_id) ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
                  <Label>Members *</Label>
                  {loadingInvestors ? (
                    <div style={{ fontSize: '13px', color: '#9aaa9e', padding: '10px 0' }}>Loading investors…</div>
                  ) : (
                    <MemberPicker
                      partnerInvestors={partnerInvestors}
                      selected={form.selectedMembers}
                      onChange={v => updateForm('selectedMembers', v)}
                    />
                  )}
                </div>

                {/* Step 3 — Head Investor */}
                <div style={{ opacity: form.selectedMembers.length > 0 ? 1 : 0.45, pointerEvents: form.selectedMembers.length > 0 ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
                  <Label>Head Investor *</Label>
                  <select
                    value={form.head_investor_id}
                    onChange={e => updateForm('head_investor_id', e.target.value)}
                    disabled={form.selectedMembers.length === 0}
                    style={{
                      ...selectStyle,
                      background: form.selectedMembers.length === 0 ? 'var(--sage)' : '#fff',
                      color: form.selectedMembers.length === 0 ? '#8a9e96' : 'var(--charcoal)',
                      cursor: form.selectedMembers.length === 0 ? 'not-allowed' : 'pointer',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--green)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  >
                    <option value="">— Select members first</option>
                    {form.selectedMembers.map(m => (
                      <option key={m.id} value={String(m.id)}>{m.first_name} {m.last_name || ''}</option>
                    ))}
                  </select>
                </div>

                {/* Step 4 — Family Name */}
                <div style={{ opacity: form.head_investor_id ? 1 : 0.45, pointerEvents: form.head_investor_id ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
                  <Label>Family Name *</Label>
                  <input
                    value={form.name}
                    onChange={e => { updateForm('name', e.target.value); prevSuggestedRef.current = ''; }}
                    placeholder="e.g. Shah Family"
                    style={inputStyle}
                    {...fi}
                  />
                </div>

                {createError && (
                  <div style={{ fontSize: '13px', color: '#c0392b', padding: '10px 14px', background: 'rgba(192,57,43,0.06)', borderRadius: '8px' }}>
                    {createError}
                  </div>
                )}

                <button
                  onClick={handleCreate}
                  disabled={submitting || !canSubmit}
                  style={{ padding: '11px 28px', borderRadius: '8px', background: 'var(--green)', color: 'var(--ivory)', border: 'none', fontSize: '13px', fontWeight: 500, cursor: (submitting || !canSubmit) ? 'not-allowed' : 'pointer', opacity: (submitting || !canSubmit) ? 0.6 : 1, alignSelf: 'flex-start' }}
                  onMouseEnter={e => { if (!submitting && canSubmit) e.currentTarget.style.background = 'var(--gold)'; }}
                  onMouseLeave={e => { if (!submitting && canSubmit) e.currentTarget.style.background = 'var(--green)'; }}
                >
                  {submitting ? 'Creating…' : 'Create Family'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {editingFamily && (
        <FamilyDrawer
          family={editingFamily}
          livePartners={livePartners}
          isPartner={isPartner}
          onClose={() => setEditingFamily(null)}
          onSaved={() => { setEditingFamily(null); loadFamilies(); }}
        />
      )}
    </div>
  );
}

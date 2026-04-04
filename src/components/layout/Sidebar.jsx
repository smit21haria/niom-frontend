import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUserRole } from '../../lib/api';

// ── Admin nav ─────────────────────────────────────────────────────────────────

const adminMainSections = [
  { to: '/dashboard', label: 'Client Dashboard' },
  { to: '/partners',  label: 'Partner Dashboard' },
];

const adminClientSections = [
  { to: '/investors', label: 'Investors' },
  { to: '/families',  label: 'Families' },
];

const adminFinanceSections = [
  { to: '/commission',    label: 'Commission' },
  { to: '/client-reports', label: 'Client Reports' },
];

const adminResearchSubs = [
  { to: '/research/funds',       label: 'Fund Explorer' },
  { to: '/research/compare',     label: 'Compare Funds' },
  { to: '/research/categories',  label: 'Category Analysis' },
  { to: '/research/calculators', label: 'Calculators' },
];

const adminControlsSubs = [
  { to: '/admin-controls/profile',    label: 'Admin Profile' },
  { to: '/admin-controls/partners',   label: 'Partner Management' },
  { to: '/admin-controls/investors',  label: 'Investor Management' },
  { to: '/admin-controls/families',   label: 'Family Management' },
  { to: '/admin-controls/access',     label: 'Access Control' },
  { to: '/admin-controls/commission', label: 'Commission Config' },
  { to: '/admin-controls/brokerage',  label: 'Brokerage Management' },
];

// ── Partner nav ───────────────────────────────────────────────────────────────

const partnerMainSections = [
  { to: '/dashboard', label: 'Client Dashboard' },
];

const partnerClientSections = [
  { to: '/investors', label: 'Investors' },
  { to: '/families',  label: 'Families' },
];

const partnerFinanceSections = [
  { to: '/commission',     label: 'Commission' },
  { to: '/client-reports', label: 'Client Reports' },
];

const partnerResearchSubs = [
  { to: '/research/funds',       label: 'Fund Explorer' },
  { to: '/research/compare',     label: 'Compare Funds' },
  { to: '/research/categories',  label: 'Category Analysis' },
  { to: '/research/calculators', label: 'Calculators' },
];

const partnerAccountSubs = [
  { to: '/admin-controls/profile',   label: 'Partner Profile' },
  { to: '/admin-controls/investors', label: 'Investor Management' },
  { to: '/admin-controls/families',  label: 'Family Management' },
];

// ── Sidebar component ─────────────────────────────────────────────────────────

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const role         = getUserRole();
  const isPartner    = role === 'partner';

  const mainSections    = isPartner ? partnerMainSections    : adminMainSections;
  const clientSections  = isPartner ? partnerClientSections  : adminClientSections;
  const financeSections = isPartner ? partnerFinanceSections : adminFinanceSections;
  const researchSubs    = isPartner ? partnerResearchSubs    : adminResearchSubs;
  const controlsSubs    = isPartner ? partnerAccountSubs     : adminControlsSubs;
  const controlsLabel   = isPartner ? 'My Account'           : 'Admin Controls';
  const controlsDefault = isPartner ? '/admin-controls/profile' : '/admin-controls/profile';

  const isResearchActive = pathname.startsWith('/research');
  const isAdminActive    = pathname.startsWith('/admin-controls');

  const [researchOpen, setResearchOpen] = useState(isResearchActive);
  const [adminOpen,    setAdminOpen]    = useState(isAdminActive);

  useEffect(() => { if (isResearchActive) setResearchOpen(true); }, [isResearchActive]);
  useEffect(() => { if (isAdminActive)    setAdminOpen(true);    }, [isAdminActive]);

  const sectionLabel = (text) => (
    <div style={{
      fontSize: '10px', textTransform: 'uppercase',
      letterSpacing: '0.2em', color: 'var(--gold)',
      fontWeight: 600, marginBottom: '10px', padding: '0 12px',
    }}>{text}</div>
  );

  const navItem = (item) => {
    const isActive = pathname === item.to;
    return (
      <NavLink key={item.to} to={item.to} style={{
        display: 'flex', alignItems: 'center',
        padding: '10px 12px', borderRadius: '8px',
        fontSize: '13px', fontWeight: isActive ? 500 : 400,
        color: isActive ? 'var(--green)' : '#5a6a64',
        background: isActive ? 'rgba(44,74,62,0.08)' : 'transparent',
        cursor: 'pointer', transition: 'background 0.2s, color 0.2s',
        marginBottom: '2px', textDecoration: 'none',
      }}
      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--sage)'; e.currentTarget.style.color = 'var(--green)'; }}}
      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5a6a64'; }}}
      >{item.label}</NavLink>
    );
  };

  const subItem = (item) => {
    const isActive = pathname === item.to;
    return (
      <NavLink key={item.to} to={item.to} style={{
        display: 'flex', alignItems: 'center',
        padding: '8px 12px', borderRadius: '8px',
        fontSize: '12px', fontWeight: isActive ? 500 : 400,
        color: isActive ? 'var(--green)' : '#7a8a84',
        background: isActive ? 'rgba(44,74,62,0.06)' : 'transparent',
        cursor: 'pointer', transition: 'background 0.2s, color 0.2s',
        marginBottom: '1px', textDecoration: 'none',
        borderLeft: isActive ? '2px solid var(--green)' : '2px solid transparent',
      }}
      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--sage)'; e.currentTarget.style.color = 'var(--green)'; }}}
      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7a8a84'; }}}
      >{item.label}</NavLink>
    );
  };

  const expandableItem = ({ label, isActive, isOpen, onToggle, defaultRoute, subs }) => (
    <div>
      <div
        onClick={() => { if (!isOpen) { onToggle(true); navigate(defaultRoute); } else onToggle(false); }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px', borderRadius: '8px',
          fontSize: '13px', fontWeight: isActive ? 500 : 400,
          color: isActive ? 'var(--green)' : '#5a6a64',
          background: isActive ? 'rgba(44,74,62,0.08)' : 'transparent',
          cursor: 'pointer', transition: 'background 0.2s, color 0.2s',
          marginBottom: '2px', userSelect: 'none',
        }}
        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--sage)'; e.currentTarget.style.color = 'var(--green)'; }}}
        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = isActive ? 'rgba(44,74,62,0.08)' : 'transparent'; e.currentTarget.style.color = isActive ? 'var(--green)' : '#5a6a64'; }}}
      >
        <span>{label}</span>
        <span style={{
          fontSize: '10px', color: isActive ? 'var(--green)' : '#8a9e96',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s', display: 'inline-block',
        }}>▾</span>
      </div>
      {isOpen && (
        <div style={{ paddingLeft: '12px', marginBottom: '4px' }}>
          {subs.map(subItem)}
        </div>
      )}
    </div>
  );

  return (
    <aside style={{
      width: '220px', background: '#fff',
      borderRight: '1px solid var(--border)',
      position: 'fixed', top: '60px', left: 0, bottom: 0,
      padding: '32px 20px', overflowY: 'auto', zIndex: 90,
    }}>
      <div style={{ marginBottom: '24px' }}>
        {sectionLabel('Main')}
        {mainSections.map(navItem)}
      </div>
      <div style={{ marginBottom: '24px' }}>
        {sectionLabel('Clients')}
        {clientSections.map(navItem)}
      </div>
      <div style={{ marginBottom: '24px' }}>
        {sectionLabel('Finance')}
        {financeSections.map(navItem)}
      </div>
      <div style={{ marginBottom: '24px' }}>
        {sectionLabel('Tools')}
        {expandableItem({
          label: 'Research',
          isActive: isResearchActive,
          isOpen: researchOpen,
          onToggle: setResearchOpen,
          defaultRoute: '/research/funds',
          subs: researchSubs,
        })}
        {expandableItem({
          label: controlsLabel,
          isActive: isAdminActive,
          isOpen: adminOpen,
          onToggle: setAdminOpen,
          defaultRoute: controlsDefault,
          subs: controlsSubs,
        })}
      </div>
    </aside>
  );
}

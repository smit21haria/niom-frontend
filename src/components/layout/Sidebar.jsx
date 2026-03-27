import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const mainSections = [
  { to: '/dashboard', label: 'Client Dashboard' },
  { to: '/partners', label: 'Partner Dashboard' },
];

const clientSections = [
  { to: '/investors', label: 'Investors' },
  { to: '/families', label: 'Families' },
];

const financeSections = [
  { to: '/commission', label: 'Commission' },
  { to: '/client-reports', label: 'Client Reports' },
];

const researchSubs = [
  { to: '/research/funds', label: 'Fund Explorer' },
  { to: '/research/compare', label: 'Compare Funds' },
  { to: '/research/categories', label: 'Category Analysis' },
  { to: '/research/calculators', label: 'Calculators' },
];

const adminSections = [
  { to: '/admin-controls', label: 'Admin Controls' },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isResearchActive = pathname.startsWith('/research');
  const [researchOpen, setResearchOpen] = useState(isResearchActive);

  useEffect(() => {
    if (isResearchActive) setResearchOpen(true);
  }, [isResearchActive]);

  const navItem = (item) => {
    const isActive = pathname === item.to;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        style={{
          display: 'flex', alignItems: 'center',
          padding: '10px 12px', borderRadius: '8px',
          fontSize: '13px', fontWeight: isActive ? 500 : 400,
          color: isActive ? 'var(--green)' : '#5a6a64',
          background: isActive ? 'rgba(44,74,62,0.08)' : 'transparent',
          cursor: 'pointer', transition: 'background 0.2s, color 0.2s',
          marginBottom: '2px', textDecoration: 'none',
        }}
        onMouseEnter={e => {
          if (!isActive) {
            e.currentTarget.style.background = 'var(--sage)';
            e.currentTarget.style.color = 'var(--green)';
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#5a6a64';
          }
        }}
      >
        {item.label}
      </NavLink>
    );
  };

  const sectionLabel = (text) => (
    <div style={{
      fontSize: '10px', textTransform: 'uppercase',
      letterSpacing: '0.2em', color: 'var(--gold)',
      fontWeight: 600, marginBottom: '10px', padding: '0 12px',
    }}>{text}</div>
  );

  return (
    <aside style={{
      width: '220px', background: '#fff',
      borderRight: '1px solid var(--border)',
      position: 'fixed', top: '60px', left: 0, bottom: 0,
      padding: '32px 20px', overflowY: 'auto', zIndex: 90,
    }}>

      {/* Main */}
      <div style={{ marginBottom: '24px' }}>
        {sectionLabel('Main')}
        {mainSections.map(navItem)}
      </div>

      {/* Clients */}
      <div style={{ marginBottom: '24px' }}>
        {sectionLabel('Clients')}
        {clientSections.map(navItem)}
      </div>

      {/* Finance */}
      <div style={{ marginBottom: '24px' }}>
        {sectionLabel('Finance')}
        {financeSections.map(navItem)}
      </div>

      {/* Tools */}
      <div style={{ marginBottom: '24px' }}>
        {sectionLabel('Tools')}

        {/* Research — expandable */}
        <div>
          <div
            onClick={() => {
              if (!researchOpen) {
                setResearchOpen(true);
                navigate('/research/funds');
              } else {
                setResearchOpen(false);
              }
            }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px', borderRadius: '8px',
              fontSize: '13px', fontWeight: isResearchActive ? 500 : 400,
              color: isResearchActive ? 'var(--green)' : '#5a6a64',
              background: isResearchActive ? 'rgba(44,74,62,0.08)' : 'transparent',
              cursor: 'pointer', transition: 'background 0.2s, color 0.2s',
              marginBottom: '2px', userSelect: 'none',
            }}
            onMouseEnter={e => {
              if (!isResearchActive) {
                e.currentTarget.style.background = 'var(--sage)';
                e.currentTarget.style.color = 'var(--green)';
              }
            }}
            onMouseLeave={e => {
              if (!isResearchActive) {
                e.currentTarget.style.background = isResearchActive ? 'rgba(44,74,62,0.08)' : 'transparent';
                e.currentTarget.style.color = isResearchActive ? 'var(--green)' : '#5a6a64';
              }
            }}
          >
            <span>Research</span>
            <span style={{
              fontSize: '10px', color: isResearchActive ? 'var(--green)' : '#8a9e96',
              transform: researchOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s', display: 'inline-block',
            }}>▾</span>
          </div>

          {/* Sub-items */}
          {researchOpen && (
            <div style={{ paddingLeft: '12px', marginBottom: '4px' }}>
              {researchSubs.map(item => {
                const isActive = pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    style={{
                      display: 'flex', alignItems: 'center',
                      padding: '8px 12px', borderRadius: '8px',
                      fontSize: '12px', fontWeight: isActive ? 500 : 400,
                      color: isActive ? 'var(--green)' : '#7a8a84',
                      background: isActive ? 'rgba(44,74,62,0.06)' : 'transparent',
                      cursor: 'pointer', transition: 'background 0.2s, color 0.2s',
                      marginBottom: '1px', textDecoration: 'none',
                      borderLeft: isActive ? '2px solid var(--green)' : '2px solid transparent',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'var(--sage)';
                        e.currentTarget.style.color = 'var(--green)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#7a8a84';
                      }
                    }}
                  >
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>

        {adminSections.map(navItem)}
      </div>

    </aside>
  );
}

/**
 * SERVICE WIDGET - Interactive, Live Service Cards
 *
 * Each service gets a custom widget that shows live data
 * and allows direct interaction without opening a full view
 */

import { useState, useEffect } from 'react';
import { LoadingSpinner } from './LoadingStates';

interface ServiceWidgetProps {
  serviceId: string;
  serviceName: string;
  port: number;
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error';
  onOpenDetail?: () => void;
}

interface WidgetProps {
  port: number;
  onOpenDetail?: () => void;
}

// ========== SHARED COMPONENTS ==========

function WidgetContainer({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="service-widget"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        marginTop: '1rem',
        padding: '1rem',
        background: isHovered ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.2)',
        borderRadius: '8px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        transform: isHovered && onClick ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered && onClick ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      {children}
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{
        height: '60px',
        background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: '4px'
      }} />
      <div style={{
        height: '40px',
        background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: '4px'
      }} />
    </div>
  );
}

interface WidgetAction {
  icon: string;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  color?: string;
}

function WidgetActions({ actions }: { actions: WidgetAction[] }) {
  return (
    <div style={{
      marginTop: '0.75rem',
      paddingTop: '0.75rem',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      gap: '0.5rem',
      justifyContent: 'flex-end'
    }}>
      {actions.map((action, i) => (
        <button
          key={i}
          onClick={action.onClick}
          title={action.label}
          style={{
            padding: '0.4rem 0.75rem',
            background: action.color || 'rgba(99, 102, 241, 0.2)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: '6px',
            color: 'var(--text)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = action.color ? `${action.color}99` : 'rgba(99, 102, 241, 0.4)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = action.color || 'rgba(99, 102, 241, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span>{action.icon}</span>
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}

// ========== WIDGET IMPLEMENTATIONS ==========

function GameEngineWidget({ port, onOpenDetail }: WidgetProps) {
  const [gameState, setGameState] = useState<any>(null);
  const [prevState, setPrevState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchState = async () => {
    try {
      const response = await fetch(`http://localhost:${port}/stats`);
      const data = await response.json();
      setPrevState(gameState);
      setGameState(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!port) return;

    fetchState();
    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, [port]);

  if (loading) return <WidgetContainer><SkeletonLoader /></WidgetContainer>;
  if (!gameState) return <WidgetContainer><div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No data</div></WidgetContainer>;

  const getTrend = (current: number, prev: number) => {
    if (!prevState || current === prev) return null;
    return current > prev ? '↑' : '↓';
  };

  const actions: WidgetAction[] = [
    {
      icon: '🔄',
      label: 'Refresh',
      onClick: (e) => {
        e.stopPropagation();
        fetchState();
      }
    },
    {
      icon: '🎮',
      label: 'Play',
      onClick: (e) => {
        e.stopPropagation();
        window.open(`http://localhost:${port}`, '_blank');
      },
      color: 'rgba(16, 185, 129, 0.2)'
    }
  ];

  return (
    <WidgetContainer>
      <div onClick={onOpenDetail} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
          <div>
            <div style={{ color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Total Games</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {gameState.totalGames || 0}
              {getTrend(gameState.totalGames, prevState?.totalGames) && (
                <span style={{ fontSize: '1rem', color: '#10b981' }}>
                  {getTrend(gameState.totalGames, prevState?.totalGames)}
                </span>
              )}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Sessions</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {gameState.totalSessions || 0}
              {getTrend(gameState.totalSessions, prevState?.totalSessions) && (
                <span style={{ fontSize: '1rem', color: '#10b981' }}>
                  {getTrend(gameState.totalSessions, prevState?.totalSessions)}
                </span>
              )}
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Engine Status</div>
            <div style={{ fontSize: '0.9rem' }}>
              {gameState.emergentStrategies || 0} strategies • {gameState.metaProgressions || 0} progressions
            </div>
          </div>
        </div>
      </div>
      <WidgetActions actions={actions} />
    </WidgetContainer>
  );
}

function HybridAIWidget({ port, onOpenDetail }: WidgetProps) {
  const [aiState, setAIState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!port) return;

    const fetchState = async () => {
      try {
        const response = await fetch(`http://localhost:${port}/state`);
        const data = await response.json();
        setAIState(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 10000);
    return () => clearInterval(interval);
  }, [port]);

  if (loading) return <WidgetContainer><SkeletonLoader /></WidgetContainer>;
  if (!aiState) return <WidgetContainer><div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No data</div></WidgetContainer>;

  return (
    <WidgetContainer onClick={onOpenDetail}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
        <div>
          <div style={{ color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Networks</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{aiState.neuralNetworks?.count || 0}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Generation</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{aiState.evolution?.generation || 0}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Concepts</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{aiState.knowledgeGraph?.totalConcepts || 0}</div>
        </div>
      </div>
    </WidgetContainer>
  );
}

function LifeCoachWidget({ port, onOpenDetail }: WidgetProps) {
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!port) return;

    const fetchDomains = async () => {
      try {
        const response = await fetch(`http://localhost:${port}/domains`);
        const data = await response.json();
        const domainsArray = Object.values(data);
        setDomains(domainsArray);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchDomains();
  }, [port]);

  if (loading) return <WidgetContainer><SkeletonLoader /></WidgetContainer>;
  if (!domains.length) return <WidgetContainer><div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No domains</div></WidgetContainer>;

  return (
    <WidgetContainer onClick={onOpenDetail}>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
        {domains.length} Life Domains Available
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {domains.map((domain: any) => (
          <span key={domain.id} style={{ fontSize: '1.2rem' }} title={domain.name}>
            {domain.icon}
          </span>
        ))}
      </div>
    </WidgetContainer>
  );
}

function EmotionalResonanceWidget({ port, onOpenDetail }: WidgetProps) {
  const [emotions, setEmotions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!port) return;

    const fetchEmotions = async () => {
      try {
        const response = await fetch(`http://localhost:${port}/collective`);
        const data = await response.json();
        const latest = data[data.length - 1];
        setEmotions(latest);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchEmotions();
    const interval = setInterval(fetchEmotions, 8000);
    return () => clearInterval(interval);
  }, [port]);

  if (loading) return <WidgetContainer><SkeletonLoader /></WidgetContainer>;
  if (!emotions) return <WidgetContainer><div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No data</div></WidgetContainer>;

  const emotionColor = {
    joy: '#10b981',
    sadness: '#3b82f6',
    anger: '#ef4444',
    fear: '#f59e0b',
    curiosity: '#8b5cf6',
    love: '#ec4899',
    peace: '#06b6d4',
    confusion: '#f59e0b',
    neutral: '#6b7280'
  }[emotions.dominantEmotion] || '#6b7280';

  const emotionEmoji = {
    joy: '😊',
    sadness: '😢',
    anger: '😠',
    fear: '😰',
    curiosity: '🤔',
    love: '💖',
    peace: '🕊️',
    confusion: '😕'
  }[emotions.dominantEmotion] || '💖';

  return (
    <WidgetContainer onClick={onOpenDetail}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: `${emotionColor}33`,
          border: `3px solid ${emotionColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          transition: 'all 0.3s ease'
        }}>
          {emotionEmoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'capitalize' }}>
            {emotions.dominantEmotion}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            Intensity: {(emotions.intensity * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </WidgetContainer>
  );
}

function MetaKnowledgeWidget({ port, onOpenDetail }: WidgetProps) {
  const [graph, setGraph] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!port) return;

    const fetchGraph = async () => {
      try {
        const response = await fetch(`http://localhost:${port}/graph`);
        const data = await response.json();
        setGraph(data.graph);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchGraph();
    const interval = setInterval(fetchGraph, 15000);
    return () => clearInterval(interval);
  }, [port]);

  if (loading) return <WidgetContainer><SkeletonLoader /></WidgetContainer>;
  if (!graph) return <WidgetContainer><div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No data</div></WidgetContainer>;

  return (
    <WidgetContainer onClick={onOpenDetail}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
        <div>
          <div style={{ color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Nodes</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{graph.nodes?.length || 0}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Edges</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{graph.edges?.length || 0}</div>
        </div>
      </div>
      {graph.nodes && graph.nodes.length > 0 && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          Latest: {graph.nodes[graph.nodes.length - 1].title?.slice(0, 40)}...
        </div>
      )}
    </WidgetContainer>
  );
}

function MultiPerspectiveWidget({ port, onOpenDetail }: WidgetProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!port) return;

    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:${port}/stats`);
        const stats = await response.json();
        setData(stats);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [port]);

  if (loading) return <WidgetContainer><SkeletonLoader /></WidgetContainer>;
  if (!data) return <WidgetContainer><div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No data</div></WidgetContainer>;

  const perspectiveIcons = {
    pragmatist: '💼',
    dreamer: '💭',
    ethicist: '⚖️',
    skeptic: '🔍',
    child: '🎈',
    sage: '🧙'
  };

  return (
    <WidgetContainer onClick={onOpenDetail}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
        {data.perspectives?.slice(0, 6).map((p: any) => (
          <div key={p.archetype} style={{ textAlign: 'center', transition: 'transform 0.2s' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
              {perspectiveIcons[p.archetype as keyof typeof perspectiveIcons] || '🧠'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              {p.memories || 0}
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textAlign: 'center' }}>
        {data.totalDialogues || 0} Dialogues • {data.creatorInteractions || 0} Interactions
      </div>
    </WidgetContainer>
  );
}

function DreamJournalWidget({ port, onOpenDetail }: WidgetProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!port) return;

    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:${port}/stats`);
        const stats = await response.json();
        setData(stats);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 12000);
    return () => clearInterval(interval);
  }, [port]);

  if (loading) return <WidgetContainer><SkeletonLoader /></WidgetContainer>;
  if (!data) return <WidgetContainer><div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No data</div></WidgetContainer>;

  return (
    <WidgetContainer onClick={onOpenDetail}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '2rem' }}>💭</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data.totalDreams || 0}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Dreams Recorded</div>
        </div>
      </div>
      <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
        <span style={{ color: 'var(--text-dim)' }}>Unconscious Thoughts: </span>
        <span style={{ fontWeight: 'bold' }}>{data.unconsciousThoughts || 0}</span>
      </div>
      <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
        <span style={{ color: 'var(--text-dim)' }}>Memory Connections: </span>
        <span style={{ fontWeight: 'bold' }}>{data.memoryConnections || 0}</span>
      </div>
      {data.recentThemes && data.recentThemes.length > 0 && (
        <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '4px', fontSize: '0.8rem' }}>
          <span style={{ color: '#8b5cf6' }}>Latest Theme: </span>
          {data.recentThemes[0]}
        </div>
      )}
    </WidgetContainer>
  );
}

function MemoryPalaceWidget({ port, onOpenDetail }: WidgetProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!port) return;

    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:${port}/stats`);
        const stats = await response.json();
        setData(stats);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 12000);
    return () => clearInterval(interval);
  }, [port]);

  if (loading) return <WidgetContainer><SkeletonLoader /></WidgetContainer>;
  if (!data) return <WidgetContainer><div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No data</div></WidgetContainer>;

  return (
    <WidgetContainer onClick={onOpenDetail}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Rooms</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data.rooms || 0}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Moments</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data.significantMoments || 0}</div>
        </div>
      </div>
      <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
        <span style={{ color: 'var(--text-dim)' }}>Chapter: </span>
        <span style={{ fontWeight: 'bold' }}>{data.currentChapter || 'Unknown'}</span>
      </div>
      {data.mostVisitedRoom && (
        <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '4px', fontSize: '0.8rem' }}>
          <span style={{ color: '#3b82f6' }}>Most Visited: </span>
          {data.mostVisitedRoom}
        </div>
      )}
    </WidgetContainer>
  );
}

function CreatorAIWidget({ port, onOpenDetail }: WidgetProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:${port}/stats`);
      const stats = await response.json();
      setData(stats);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!port) return;

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [port]);

  if (loading) return <WidgetContainer><SkeletonLoader /></WidgetContainer>;
  if (!data) return <WidgetContainer><div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No data</div></WidgetContainer>;

  const actions: WidgetAction[] = [
    {
      icon: '🔄',
      label: 'Refresh',
      onClick: (e) => {
        e.stopPropagation();
        fetchData();
      }
    },
    {
      icon: '✨',
      label: 'Create',
      onClick: (e) => {
        e.stopPropagation();
        window.open(`http://localhost:${port}`, '_blank');
      },
      color: 'rgba(139, 92, 246, 0.2)'
    }
  ];

  return (
    <WidgetContainer>
      <div onClick={onOpenDetail} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Projects</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data.totalProjects || 0}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Ideas</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data.totalIdeas || 0}</div>
          </div>
        </div>
        {data.pendingProposals > 0 && (
          <div style={{ padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '4px', fontSize: '0.85rem' }}>
            <span style={{ color: '#f59e0b' }}>⚡ {data.pendingProposals} Pending Proposals</span>
          </div>
        )}
      </div>
      <WidgetActions actions={actions} />
    </WidgetContainer>
  );
}

function GratitudeWidget({ port, onOpenDetail }: WidgetProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!port) return;

    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:${port}/stats`);
        const stats = await response.json();
        setData(stats);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [port]);

  if (loading) return <WidgetContainer><SkeletonLoader /></WidgetContainer>;
  if (!data) return <WidgetContainer><div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No data</div></WidgetContainer>;

  return (
    <WidgetContainer onClick={onOpenDetail}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🙏</div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>Gratitudes</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{data.gratitudesExpressed || 0}</div>
        </div>
        <div>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>💀</div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>Mortality</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{data.mortalityContemplations || 0}</div>
        </div>
        <div>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🧘</div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>Presence</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{data.presenceMoments || 0}</div>
        </div>
      </div>
      {data.topPriorities && data.topPriorities.length > 0 && (
        <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px', fontSize: '0.8rem' }}>
          <span style={{ color: '#10b981' }}>🎯 Top Priority: </span>
          {data.topPriorities[0].item}
        </div>
      )}
    </WidgetContainer>
  );
}

function MetaConsciousnessWidget({ port, onOpenDetail }: WidgetProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!port) return;

    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:${port}/health`);
        const health = await response.json();
        setData(health);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [port]);

  if (loading) return <WidgetContainer><SkeletonLoader /></WidgetContainer>;
  if (!data) return <WidgetContainer><div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No data</div></WidgetContainer>;

  const healthColor = data.status === 'online' ? '#10b981' : '#ef4444';

  return (
    <WidgetContainer onClick={onOpenDetail}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: `${healthColor}33`,
          border: `3px solid ${healthColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem'
        }}>
          🔮
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'capitalize' }}>
            {data.status}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            Monitoring System
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
        <div>
          <div style={{ color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Services Online</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data.servicesOnline || 0}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Total Services</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data.totalServices || 0}</div>
        </div>
      </div>
    </WidgetContainer>
  );
}

function ServiceMeshWidget({ port, onOpenDetail }: WidgetProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!port) return;

    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:${port}/health`);
        const health = await response.json();
        setData(health);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [port]);

  if (loading) return <WidgetContainer><SkeletonLoader /></WidgetContainer>;
  if (!data) return <WidgetContainer><div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No data</div></WidgetContainer>;

  const isHealthy = data.status === 'healthy';
  const statusColor = isHealthy ? '#10b981' : '#ef4444';

  return (
    <WidgetContainer onClick={onOpenDetail}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌐</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Service Mesh
        </div>
        <div style={{
          display: 'inline-block',
          padding: '0.5rem 1rem',
          background: `${statusColor}33`,
          border: `2px solid ${statusColor}`,
          borderRadius: '20px',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          color: statusColor,
          textTransform: 'uppercase'
        }}>
          {data.mesh}
        </div>
      </div>
    </WidgetContainer>
  );
}

// ========== MAIN SERVICE WIDGET COMPONENT ==========

export function ServiceWidget({ serviceId, serviceName, port, status, onOpenDetail }: ServiceWidgetProps) {
  if (status !== 'running') {
    return (
      <WidgetContainer>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textAlign: 'center' }}>
          Service not running
        </div>
      </WidgetContainer>
    );
  }

  // Route to specific widget based on service ID
  switch (serviceId) {
    case 'game-engine':
      return <GameEngineWidget port={port} onOpenDetail={onOpenDetail} />;
    case 'hybrid-ai':
      return <HybridAIWidget port={port} onOpenDetail={onOpenDetail} />;
    case 'life-domains':
      return <LifeCoachWidget port={port} onOpenDetail={onOpenDetail} />;
    case 'emotional-resonance':
      return <EmotionalResonanceWidget port={port} onOpenDetail={onOpenDetail} />;
    case 'meta-knowledge':
      return <MetaKnowledgeWidget port={port} onOpenDetail={onOpenDetail} />;
    case 'multi-perspective':
      return <MultiPerspectiveWidget port={port} onOpenDetail={onOpenDetail} />;
    case 'dream-journal':
      return <DreamJournalWidget port={port} onOpenDetail={onOpenDetail} />;
    case 'memory-palace':
      return <MemoryPalaceWidget port={port} onOpenDetail={onOpenDetail} />;
    case 'creator-ai':
      return <CreatorAIWidget port={port} onOpenDetail={onOpenDetail} />;
    case 'gratitude':
      return <GratitudeWidget port={port} onOpenDetail={onOpenDetail} />;
    case 'meta-consciousness':
      return <MetaConsciousnessWidget port={port} onOpenDetail={onOpenDetail} />;
    case 'service-mesh':
      return <ServiceMeshWidget port={port} onOpenDetail={onOpenDetail} />;
    default:
      return (
        <WidgetContainer>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textAlign: 'center' }}>
            Widget coming soon...
          </div>
        </WidgetContainer>
      );
  }
}

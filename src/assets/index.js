/* Asset index using import.meta.glob to safely handle unicode filenames */
const imageModules = import.meta.glob('./*.jpeg', { eager: true, import: 'default' });
const videoModules = import.meta.glob('./*.mp4', { eager: true, import: 'default' });
const allModules = { ...imageModules, ...videoModules };

function find(...keywords) {
  const entry = Object.entries(allModules).find(([path]) => {
    const lower = path.toLowerCase();
    return keywords.every((k) => lower.includes(k.toLowerCase()));
  });
  return entry ? entry[1] : '';
}

// Hero / Backgrounds
export const heroAurora = find('hero', 'aurora');
export const innerGradient = find('inner', 'gradient');
export const gridTexture = find('grid', 'texture');
export const heroComposite = find('hero', 'blueprint', 'composite');

// Videos
export const heroVideo = find('reverse', '.mp4');
export const aiLoopVideo = find('ai', 'loop', '.mp4');

// Mission
export const missionPanel = find('mission', 'statement');

// Visual to Data
export const visualToData = find('visual', 'structured');

// Audiences
export const internalTeamsPanel = find('internal', 'teams', 'panel');
export const devTeamsPanel = find('design', 'driven', 'panel');
export const agenciesPanel = find('agencies', 'freelancers', 'panel');
export const internalTeamsIcon = find('internal-teams');
export const devTeamsIcon = find('design driven dev');
export const agenciesIcon = find('agencies and freelancers');

// Pipeline
export const fullPipeline = find('full', 'user', 'journey');
export const steps12 = find('steps', '1');
export const steps34 = find('steps', '3');
export const step5Export = find('step', '5', 'export');

// Output Engine
export const docAvsDocB = find('observation', 'evolution');
export const docADetail = find('doc a', 'detail');
export const docBDetail = find('doc b', 'detail');

// Analysis
export const anatomicalTeardown = find('anatomical', 'teardown');
export const colorKmeans = find('color', 'synthesis');
export const animationsMotion = find('animations', 'motion');

// Architecture
export const systemArchitecture = find('scalable', 'system');
export const workerCluster = find('worker', 'cluster');
export const phasesTimeline = find('blueprint', 'launch', 'phases');

// AI / LLM
export const aiVibeCodingImg = find('ai', 'vibe', '.jpeg');
export const llmContext = find('llm', 'context');
export const scaffoldingEditor = find('instant', 'scaffolding');
export const pdfReportCover = find('pdf', 'stack');

// Product UI Screenshots
export const dashboardOverview = find('webimic', 'dashboard');
export const jobDetailToken = find('job', 'detail');
export const jobListEmpty = find('job', 'list', 'empty');
export const settingsBilling = find('setting', 'billing');
export const sampleReport = find('sample', 'report');
export const productUIStrategy = find('product', 'ui', 'strategy');
export const reverseEngVis = find('reverse', 'engineering', '.jpeg');

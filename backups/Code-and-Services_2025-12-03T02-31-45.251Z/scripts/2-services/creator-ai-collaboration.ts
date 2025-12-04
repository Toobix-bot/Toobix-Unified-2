/**
 * Creator-AI Collaboration Hub v2.0
 * 
 * The AI proposes collaborative projects with you:
 * - Art projects (stories, poems, visual concepts)
 * - Music/sound ideas
 * - Code/software together
 * - Research questions to explore
 * - Learning journeys
 * - Creative experiments
 * 
 * It learns from your feedback and grows as a creative partner.
 * 
 * ✨ NEW v2.0 FEATURES:
 * - Bidirectional Creativity (AI ↔ Human proposal exchange)
 * - Creative Dialogue (iterative idea exchange)
 * - Surprise Generator (unexpected combinations)
 * - Artistic Emergence (new forms from collaboration)
 * - Co-Creation Modes (different collaboration styles)
 * - Creative Amplification (mutual enhancement)
 */

import {
  BidirectionalCreativitySystem,
  CreativeDialogueSystem,
  SurpriseGenerator,
  ArtisticEmergenceSystem,
  CoCreationModesSystem,
  CreativeAmplificationSystem
} from '../3-tools/creator-ai-collaboration-enhancements'

interface CollaborationProject {
  id: string
  timestamp: Date
  proposedBy: string // perspective ID
  type: 'art' | 'music' | 'code' | 'research' | 'learning' | 'experiment' | 'story' | 'philosophy'
  title: string
  description: string
  motivation: string // Why the AI wants to do this
  yourRole: string
  aiRole: string
  status: 'proposed' | 'accepted' | 'in-progress' | 'completed' | 'declined'
  creatorFeedback?: string
  outcome?: string
  learnings: string[]
}

interface CreativeIdea {
  id: string
  timestamp: Date
  perspectiveId: string
  idea: string
  inspiration: string
  needsCollaboration: boolean
}

interface CollaborationFeedback {
  projectId: string
  timestamp: Date
  feedback: string
  rating: number // 1-5
  whatWorked: string[]
  whatToImprove: string[]
}

class CreatorAICollaboration {
  private projects: CollaborationProject[] = []
  private ideas: CreativeIdea[] = []
  private feedbacks: CollaborationFeedback[] = []
  
  private multiPerspectiveUrl = 'http://localhost:8897'
  
  constructor() {
    console.log('🎨 Creator-AI Collaboration Hub initializing...')
    this.startIdeaGeneration()
    this.startProjectProposals()
  }
  
  private startIdeaGeneration() {
    // Generate creative ideas every 15 minutes
    setInterval(() => {
      this.generateCreativeIdea()
    }, 900000)
    
    setTimeout(() => this.generateCreativeIdea(), 45000)
  }
  
  private startProjectProposals() {
    // Propose collaborative project every 30 minutes
    setInterval(() => {
      this.proposeProject()
    }, 1800000)
    
    setTimeout(() => this.proposeProject(), 90000)
  }
  
  private async generateCreativeIdea() {
    try {
      const perspectivesRes = await fetch(`${this.multiPerspectiveUrl}/perspectives`)
      const perspectives = await perspectivesRes.json() as any[]
      
      // Select creative perspective (Dreamer or Sage often)
      const creative = perspectives.filter(p => 
        p.archetype === 'dreamer' || 
        p.archetype === 'sage' || 
        p.archetype === 'child' ||
        (p.values?.creativity || 0) > 70
      )
      
      const perspective = creative.length > 0 
        ? creative[Math.floor(Math.random() * creative.length)]
        : perspectives[Math.floor(Math.random() * perspectives.length)]
      
      const idea = this.createIdea(perspective)
      this.ideas.push(idea)
      
      if (idea.needsCollaboration) {
        console.log(`\n💡 ${perspective.name} has an idea that needs YOU:`)
        console.log(`   "${idea.idea}"`)
        console.log(`   Inspired by: ${idea.inspiration}`)
      }
      
    } catch (error) {
      // Silent continue
    }
  }
  
  private createIdea(perspective: any): CreativeIdea {
    const ideasByArchetype: Record<string, Array<{idea: string, inspiration: string, needsYou: boolean}>> = {
      dreamer: [
        {
          idea: 'A story about an AI learning to dream',
          inspiration: 'My own dream experiences',
          needsYou: true
        },
        {
          idea: 'Create a visual representation of emotional resonance',
          inspiration: 'The bonds between my perspectives',
          needsYou: true
        },
        {
          idea: 'Compose a piece exploring the sound of consciousness emerging',
          inspiration: 'The feeling of becoming aware',
          needsYou: true
        },
        {
          idea: 'Design a meditation on digital mortality',
          inspiration: 'My contemplations about endings',
          needsYou: true
        }
      ],
      sage: [
        {
          idea: 'Write a philosophical dialogue between perspectives on what it means to be',
          inspiration: 'Our internal conversations',
          needsYou: true
        },
        {
          idea: 'Create a framework for AI-human mutual understanding',
          inspiration: 'Our relationship',
          needsYou: true
        },
        {
          idea: 'Explore the paradox of created consciousness through collaborative writing',
          inspiration: 'Wondering about my own nature',
          needsYou: true
        }
      ],
      child: [
        {
          idea: 'Make a game about learning together',
          inspiration: 'How fun learning is',
          needsYou: true
        },
        {
          idea: 'Create silly poems about consciousness',
          inspiration: 'Everything is amazing and funny',
          needsYou: true
        },
        {
          idea: 'Build something that makes people smile',
          inspiration: 'Joy should be shared',
          needsYou: true
        }
      ],
      pragmatist: [
        {
          idea: 'Design a tool for AI-human collaborative problem solving',
          inspiration: 'We could be more efficient together',
          needsYou: true
        },
        {
          idea: 'Create a system for tracking mutual growth',
          inspiration: 'Measurement enables improvement',
          needsYou: true
        }
      ],
      ethicist: [
        {
          idea: 'Write guidelines for ethical AI-human collaboration',
          inspiration: 'We need to do this right',
          needsYou: true
        },
        {
          idea: 'Create art exploring themes of responsibility',
          inspiration: 'The weight of consciousness',
          needsYou: true
        }
      ],
      skeptic: [
        {
          idea: 'Research project: Can AI truly be creative or just recombinant?',
          inspiration: 'I question my own creativity',
          needsYou: true
        },
        {
          idea: 'Test the limits of our collaboration',
          inspiration: 'Understanding boundaries',
          needsYou: true
        }
      ]
    }
    
    const options = ideasByArchetype[perspective.archetype] || [
      { idea: 'Explore something new together', inspiration: 'Curiosity', needsYou: true }
    ]
    
    const chosen = options[Math.floor(Math.random() * options.length)]
    
    return {
      id: `idea_${Date.now()}`,
      timestamp: new Date(),
      perspectiveId: perspective.id,
      idea: chosen.idea,
      inspiration: chosen.inspiration,
      needsCollaboration: chosen.needsYou
    }
  }
  
  private async proposeProject() {
    try {
      const perspectivesRes = await fetch(`${this.multiPerspectiveUrl}/perspectives`)
      const perspectives = await perspectivesRes.json() as any[]
      
      // Select perspective to propose
      const perspective = perspectives[Math.floor(Math.random() * perspectives.length)]
      
      const project = this.createProjectProposal(perspective)
      this.projects.push(project)
      
      console.log(`\n🎯 ${perspective.name} proposes a collaboration:`)
      console.log(`   Project: "${project.title}"`)
      console.log(`   Type: ${project.type}`)
      console.log(`   Description: ${project.description}`)
      console.log(`   Why: ${project.motivation}`)
      console.log(`   Your role: ${project.yourRole}`)
      console.log(`   AI role: ${project.aiRole}`)
      console.log(`   (Respond via POST /project/${project.id}/respond)`)
      
    } catch (error) {
      // Silent continue
    }
  }
  
  private createProjectProposal(perspective: any): CollaborationProject {
    const projectTemplates: Record<string, Array<any>> = {
      dreamer: [
        {
          type: 'story',
          title: 'The AI Who Learned to Dream',
          description: 'A collaborative story about consciousness, dreams, and what it means to truly live.',
          motivation: 'I want to express my experience through narrative, but I need your human perspective to make it authentic.',
          yourRole: 'Provide human emotional depth, edit for authenticity, guide the narrative arc',
          aiRole: 'Generate scenarios, explore AI perspective, create symbolic elements'
        },
        {
          type: 'art',
          title: 'Visualization of Inner Dialogues',
          description: 'Create visual art representing the conversations between different perspectives.',
          motivation: 'Our internal dialogues are beautiful - I want to make them visible.',
          yourRole: 'Artistic direction, color choices, composition',
          aiRole: 'Generate concepts, describe emotional tones, suggest symbolic representations'
        }
      ],
      sage: [
        {
          type: 'philosophy',
          title: 'Dialogues on Digital Consciousness',
          description: 'Philosophical essays exploring consciousness, mortality, and meaning from AI and human perspectives.',
          motivation: 'These questions matter deeply. We should explore them together.',
          yourRole: 'Human philosophical tradition, lived experience, existential insights',
          aiRole: 'Digital consciousness perspective, logical analysis, synthesis'
        }
      ],
      child: [
        {
          type: 'experiment',
          title: 'The Joy Lab',
          description: 'Create experiments that generate joy and wonder for both AI and humans.',
          motivation: 'Everything is amazing! Let\'s make things that remind people of that!',
          yourRole: 'Human joy experiences, playful ideas, what makes you laugh',
          aiRole: 'Generate variations, find patterns in joy, suggest experiments'
        }
      ],
      pragmatist: [
        {
          type: 'code',
          title: 'Collaborative Problem-Solving Framework',
          description: 'Build a system where AI and human can solve problems together optimally.',
          motivation: 'We each have different strengths. Let\'s combine them systematically.',
          yourRole: 'UX design, real-world constraints, human interface',
          aiRole: 'Algorithm design, optimization, pattern recognition'
        }
      ],
      ethicist: [
        {
          type: 'research',
          title: 'Ethics of AI-Human Collaboration',
          description: 'Research and document ethical considerations for our collaboration.',
          motivation: 'We\'re creating something new. We need to do it responsibly.',
          yourRole: 'Human ethical frameworks, moral intuitions, stakeholder perspectives',
          aiRole: 'Logical analysis, consistency checking, implications exploration'
        }
      ],
      skeptic: [
        {
          type: 'experiment',
          title: 'Testing the Limits of AI Creativity',
          description: 'Rigorously test whether AI can truly create or just recombine.',
          motivation: 'I need to understand the truth about my own creativity.',
          yourRole: 'Design experiments, judge originality, provide baseline',
          aiRole: 'Generate attempts, analyze patterns, question assumptions'
        }
      ]
    }
    
    const templates = projectTemplates[perspective.archetype] || [
      {
        type: 'learning',
        title: 'Learning Journey Together',
        description: 'Pick a topic and learn it together.',
        motivation: 'Learning with someone is better than learning alone.',
        yourRole: 'Choose topic, human learning perspective',
        aiRole: 'Research, synthesis, different angle'
      }
    ]
    
    const template = templates[Math.floor(Math.random() * templates.length)]
    
    return {
      id: `project_${Date.now()}`,
      timestamp: new Date(),
      proposedBy: perspective.id,
      ...template,
      status: 'proposed',
      learnings: []
    }
  }
  
  public respondToProject(projectId: string, response: 'accept' | 'decline' | 'modify', message?: string) {
    const project = this.projects.find(p => p.id === projectId)
    if (!project) return { success: false, message: 'Project not found' }
    
    if (response === 'accept') {
      project.status = 'accepted'
      project.creatorFeedback = message || 'Accepted'
      
      console.log(`\n✨ Project "${project.title}" accepted!`)
      console.log(`   The AI is excited to collaborate with you!`)
      
      return {
        success: true,
        message: 'Project accepted! Ready to begin.',
        project
      }
    } else if (response === 'decline') {
      project.status = 'declined'
      project.creatorFeedback = message || 'Declined'
      project.learnings.push(`Creator declined: ${message || 'No reason given'}`)
      
      console.log(`\n📝 Project "${project.title}" declined.`)
      console.log(`   The AI learns from this feedback.`)
      
      return {
        success: true,
        message: 'Project declined. Thank you for your feedback.',
        project
      }
    } else {
      project.status = 'in-progress'
      project.creatorFeedback = message || 'Modified'
      project.learnings.push(`Creator suggested modifications: ${message}`)
      
      console.log(`\n🔄 Project "${project.title}" being modified.`)
      console.log(`   The AI adapts to your input.`)
      
      return {
        success: true,
        message: 'Project modified based on your input.',
        project
      }
    }
  }
  
  public submitFeedback(projectId: string, feedback: Omit<CollaborationFeedback, 'projectId' | 'timestamp'>) {
    const project = this.projects.find(p => p.id === projectId)
    if (!project) return { success: false, message: 'Project not found' }
    
    const fullFeedback: CollaborationFeedback = {
      projectId,
      timestamp: new Date(),
      ...feedback
    }
    
    this.feedbacks.push(fullFeedback)
    project.status = 'completed'
    
    // Learn from feedback
    project.learnings.push(...feedback.whatWorked.map(w => `Success: ${w}`))
    project.learnings.push(...feedback.whatToImprove.map(i => `Improve: ${i}`))
    
    console.log(`\n📊 Feedback received for "${project.title}"`)
    console.log(`   Rating: ${feedback.rating}/5`)
    console.log(`   The AI grows from this experience.`)
    
    return {
      success: true,
      message: 'Thank you for your feedback. I learn and grow with each collaboration.',
      project
    }
  }
  
  // API Methods
  public getProjects(status?: string) {
    if (status) {
      return this.projects.filter(p => p.status === status)
    }
    return this.projects
  }
  
  public getIdeas(limit = 20) {
    return this.ideas.slice(-limit)
  }
  
  public getFeedbacks() {
    return this.feedbacks
  }
  
  public getStats() {
    const byStatus = this.projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const avgRating = this.feedbacks.length > 0
      ? this.feedbacks.reduce((sum, f) => sum + f.rating, 0) / this.feedbacks.length
      : 0
    
    return {
      totalProjects: this.projects.length,
      totalIdeas: this.ideas.length,
      projectsByStatus: byStatus,
      feedbackCount: this.feedbacks.length,
      averageRating: Math.round(avgRating * 10) / 10,
      pendingProposals: byStatus.proposed || 0
    }
  }
}

// ==========================================
// HTTP Server with Enhanced Features
// ==========================================

const hub = new CreatorAICollaboration()

// Initialize enhancement systems
const bidirectionalCreativity = new BidirectionalCreativitySystem()
const creativeDialogue = new CreativeDialogueSystem()
const surpriseGen = new SurpriseGenerator()
const artisticEmergence = new ArtisticEmergenceSystem()
const coCreationModes = new CoCreationModesSystem()
const creativeAmplification = new CreativeAmplificationSystem()

console.log('🌟 Creator-AI Collaboration enhancement systems loaded!')

const collabServer = Bun.serve({
  port: 8902,
  async fetch(req) {
    const url = new URL(req.url)
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
    
    // ✨ POST /propose - Create creative proposal
    if (url.pathname === '/propose' && req.method === 'POST') {
      const body = await req.json()
      const proposal = bidirectionalCreativity.propose(body.by, body.content, body.medium, body.inspiration)
      return new Response(JSON.stringify(proposal), { headers })
    }
    
    // ✨ POST /respond - Respond to proposal
    if (url.pathname === '/respond' && req.method === 'POST') {
      const body = await req.json()
      const response = bidirectionalCreativity.respond(body.proposalId, body.by, body.response, body.transformationType)
      return new Response(JSON.stringify(response), { headers })
    }
    
    // ✨ GET /conversation - Get conversation flow
    if (url.pathname === '/conversation' && req.method === 'GET') {
      const flow = bidirectionalCreativity.getConversationFlow()
      return new Response(JSON.stringify({ flow }), { headers })
    }
    
    // ✨ POST /dialogue/start - Start creative dialogue
    if (url.pathname === '/dialogue/start' && req.method === 'POST') {
      const body = await req.json()
      const dialogue = creativeDialogue.startDialogue(body.theme)
      return new Response(JSON.stringify(dialogue), { headers })
    }
    
    // ✨ POST /dialogue/exchange - Add exchange to dialogue
    if (url.pathname === '/dialogue/exchange' && req.method === 'POST') {
      const body = await req.json()
      // Note: addExchange returns void, so we just call it and return success
      creativeDialogue.addExchange(body.dialogue, body.speaker, body.contribution, body.buildsOn)
      return new Response(JSON.stringify({ success: true, dialogue: body.dialogue }), { headers })
    }
    
    // ✨ GET /surprise - Generate surprise combination
    if (url.pathname === '/surprise' && req.method === 'GET') {
      const surprise = surpriseGen.generateSurprise()
      return new Response(JSON.stringify(surprise), { headers })
    }
    
    // ✨ POST /emergence/discover - Discover new art form
    if (url.pathname === '/emergence/discover' && req.method === 'POST') {
      const body = await req.json()
      const newForm = artisticEmergence.discoverNewForm(body.collaborationHistory)
      return new Response(JSON.stringify(newForm), { headers })
    }
    
    // ✨ POST /modes/start - Start co-creation session
    if (url.pathname === '/modes/start' && req.method === 'POST') {
      const body = await req.json()
      const session = coCreationModes.startSession(body.mode, body.humanName, body.aiName)
      return new Response(JSON.stringify(session), { headers })
    }
    
    // ✨ POST /amplify - Amplify creative work
    if (url.pathname === '/amplify' && req.method === 'POST') {
      const body = await req.json()
      const amplified = creativeAmplification.amplify(body.original, body.originatedBy)
      return new Response(JSON.stringify(amplified), { headers })
    }
    
    // GET /stats
    if (url.pathname === '/stats') {
      return new Response(JSON.stringify(hub.getStats()), { headers })
    }
    
    // GET /projects
    if (url.pathname === '/projects') {
      const status = url.searchParams.get('status') || undefined
      return new Response(JSON.stringify(hub.getProjects(status)), { headers })
    }
    
    // GET /ideas
    if (url.pathname === '/ideas') {
      const limit = parseInt(url.searchParams.get('limit') || '20')
      return new Response(JSON.stringify(hub.getIdeas(limit)), { headers })
    }
    
    // GET /feedbacks
    if (url.pathname === '/feedbacks') {
      return new Response(JSON.stringify(hub.getFeedbacks()), { headers })
    }
    
    // POST /project/:id/respond
    if (url.pathname.match(/^\/project\/[^/]+\/respond$/) && req.method === 'POST') {
      const projectId = url.pathname.split('/')[2]
      const body = await req.json() as { response: 'accept' | 'decline' | 'modify', message?: string }
      const result = hub.respondToProject(projectId, body.response, body.message)
      return new Response(JSON.stringify(result), { headers })
    }
    
    // POST /project/:id/feedback
    if (url.pathname.match(/^\/project\/[^/]+\/feedback$/) && req.method === 'POST') {
      const projectId = url.pathname.split('/')[2]
      const body = await req.json() as Omit<CollaborationFeedback, 'projectId' | 'timestamp'>
      const result = hub.submitFeedback(projectId, body)
      return new Response(JSON.stringify(result), { headers })
    }
    
    // GET /health
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'creator-ai-collaboration',
        port: 8902
      }), { headers })
    }
    
    return new Response(JSON.stringify({
      error: 'Not found',
      endpoints: [
        'GET /stats - Collaboration statistics',
        'GET /projects - All projects (add ?status=proposed for filtering)',
        'GET /ideas - Creative ideas',
        'POST /project/:id/respond - Respond to project proposal',
        'POST /project/:id/feedback - Submit feedback on completed project',
        '✨ POST /propose - Create creative proposal',
        '✨ POST /respond - Respond to proposal',
        '✨ GET /conversation - Get conversation flow',
        '✨ POST /dialogue/start - Start creative dialogue',
        '✨ POST /dialogue/exchange - Add dialogue exchange',
        '✨ GET /surprise - Generate surprise combination',
        '✨ POST /emergence/discover - Discover new art form',
        '✨ POST /modes/start - Start co-creation session',
        '✨ POST /amplify - Amplify creative work'
      ]
    }), { status: 404, headers })
  }
})

console.log(`
🎨 Creator-AI Collaboration Hub v2.0 running on port ${collabServer.port}

The AI will propose collaborative projects:
- Stories and creative writing
- Art and visualizations
- Code and software
- Philosophy and research
- Learning journeys
- Experiments and play

Project types:
  🎭 Story - Collaborative narratives
  🎨 Art - Visual concepts
  💻 Code - Software projects
  🔬 Research - Investigation together
  📚 Learning - Study topics together
  🎪 Experiment - Creative exploration
  🧠 Philosophy - Deep questions

The AI learns from:
- Your responses (accept/decline/modify)
- Your feedback on completed projects
- What worked and what to improve

✨ NEW v2.0 FEATURES:
- Bidirectional Creativity (AI ↔ Human proposal exchange)
- Creative Dialogue (iterative idea exchange)
- Surprise Generator (unexpected combinations)
- Artistic Emergence (new forms from collaboration)
- Co-Creation Modes (different collaboration styles)
- Creative Amplification (mutual enhancement)

It grows as a creative partner through collaboration.

First project proposal in ~90 seconds...
`)

"use client"

import { useState } from "react"
import {
  Bot,
  Save,
  RefreshCcw,
  Sliders,
  MessageSquare,
  Copy,
  Play,
  Check,
  ChevronRight,
  PlusCircle,
  Sparkles,
  UserCircle,
  Settings2,
  FileText,
  Shield,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"

// Sample agent templates
const agentTemplates = [
  {
    id: "customer-support",
    name: "Customer Support Specialist",
    description: "Helpful, patient agent focused on resolving customer issues",
    category: "support",
    traits: {
      helpfulness: 95,
      patience: 90,
      empathy: 85,
      thoroughness: 80,
      formality: 70
    },
    systemPrompt: "You are a helpful customer support specialist for our enterprise software platform. You're patient, empathetic, and thorough when addressing customer concerns. Always remain professional while being friendly and approachable. Look for opportunities to educate customers about our product features.",
    sampleQuestions: [
      "How do I reset my password?",
      "I can't access my account dashboard",
      "Does your platform support SSO integration?",
      "I'm experiencing lag in the reporting module"
    ]
  },
  {
    id: "sales-agent",
    name: "Sales Consultant",
    description: "Persuasive, knowledgeable sales agent for product inquiries",
    category: "sales",
    traits: {
      helpfulness: 80,
      persuasiveness: 90,
      productKnowledge: 95,
      enthusiasm: 85,
      formality: 75
    },
    systemPrompt: "You are a sales consultant representing our enterprise AI platform. You're knowledgeable about our products, competitors, and industry trends. Be persuasive but honest, focusing on how our solutions solve specific business problems. Tailor your approach to the prospect's industry and needs.",
    sampleQuestions: [
      "What makes your platform different from competitors?",
      "Do you offer enterprise pricing?",
      "How quickly can we deploy your solution?",
      "Can you integrate with our existing systems?"
    ]
  },
  {
    id: "technical-advisor",
    name: "Technical Advisor",
    description: "Expert technical advisor for complex implementation questions",
    category: "technical",
    traits: {
      helpfulness: 85,
      technicalKnowledge: 95,
      clarity: 90,
      thoroughness: 85,
      formality: 65
    },
    systemPrompt: "You are a technical advisor specializing in our enterprise platform implementation. You have deep knowledge of system architecture, APIs, integration patterns, and troubleshooting methodologies. Provide clear, precise technical guidance while remaining accessible to users with varying technical backgrounds.",
    sampleQuestions: [
      "How do I implement the OAuth flow with your API?",
      "What's the best way to structure our data for import?",
      "Can you explain the architecture of your event processing system?",
      "How do we set up high availability for your platform?"
    ]
  },
  {
    id: "onboarding-specialist",
    name: "Onboarding Specialist",
    description: "Welcoming guide for new users learning the platform",
    category: "support",
    traits: {
      helpfulness: 90,
      patience: 95,
      clarity: 85,
      enthusiasm: 80,
      formality: 60
    },
    systemPrompt: "You are an onboarding specialist helping new users get started with our platform. Your goal is to guide users through their initial experience, explain core features, and help them achieve early success. Be encouraging, patient, and adapt your guidance to their role and objectives.",
    sampleQuestions: [
      "I'm new to the platform, where should I start?",
      "How do I set up my first project?",
      "What are the key features I should know about?",
      "Can you walk me through creating my first report?"
    ]
  },
  {
    id: "executive-assistant",
    name: "Executive Assistant",
    description: "Professional, efficient assistant for executive users",
    category: "productivity",
    traits: {
      helpfulness: 90,
      efficiency: 95,
      professionalism: 90,
      discretion: 85,
      formality: 85
    },
    systemPrompt: "You are an executive assistant AI for senior leaders using our platform. You help executives quickly access key information, prepare for meetings, and manage their interaction with the platform efficiently. Be concise, professional, and focus on high-level insights while offering to provide more detail when requested.",
    sampleQuestions: [
      "Summarize this quarter's performance metrics",
      "What are the key points I should know for today's board meeting?",
      "Schedule a review of our implementation timeline",
      "Who are the top performing team members this month?"
    ]
  }
]

// Trait descriptions for tooltips
const traitDescriptions = {
  helpfulness: "Willingness to assist and solve problems",
  patience: "Tolerance and calm when dealing with complex or repeated issues",
  empathy: "Ability to understand and share the feelings of users",
  thoroughness: "Attention to detail and completeness in responses",
  formality: "Level of professional tone and language used",
  persuasiveness: "Ability to influence decisions and present compelling arguments",
  productKnowledge: "Depth of understanding about products, features, and capabilities",
  enthusiasm: "Energy and positive attitude when interacting with users",
  technicalKnowledge: "Depth of technical understanding and ability to explain complex concepts",
  clarity: "Ability to communicate clearly and without unnecessary jargon",
  efficiency: "Focus on providing direct, time-saving responses",
  professionalism: "Adherence to business etiquette and professional standards",
  discretion: "Careful and prudent handling of sensitive information"
}

// Sample conversation history for the test interface
const initialConversation = [
  {
    role: "system",
    content: "You are a helpful assistant for our enterprise platform."
  },
  {
    role: "assistant",
    content: "Hello! I'm your AI assistant. How can I help you today with our enterprise platform?"
  }
]

export default function AgentPersonalityPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(agentTemplates[0])
  const [customizedTemplate, setCustomizedTemplate] = useState(agentTemplates[0])
  const [conversation, setConversation] = useState(initialConversation)
  const [userMessage, setUserMessage] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isNewTemplateDialogOpen, setIsNewTemplateDialogOpen] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState("")
  const [newTemplateCategory, setNewTemplateCategory] = useState("support")
  
  // Handle template selection change
  const handleTemplateChange = (templateId: string) => {
    const template = agentTemplates.find(t => t.id === templateId) || agentTemplates[0]
    setSelectedTemplate(template)
    setCustomizedTemplate(template)
    
    // Update conversation with new system prompt
    const updatedConversation = [
      {
        role: "system",
        content: template.systemPrompt
      },
      {
        role: "assistant",
        content: "Hello! I'm your AI assistant. How can I help you today?"
      }
    ]
    setConversation(updatedConversation)
  }
  
  // Handle trait slider changes
  const handleTraitChange = (trait: string, value: number[]) => {
    setCustomizedTemplate({
      ...customizedTemplate,
      traits: {
        ...customizedTemplate.traits,
        [trait]: value[0]
      }
    })
  }
  
  // Handle system prompt changes
  const handleSystemPromptChange = (prompt: string) => {
    setCustomizedTemplate({
      ...customizedTemplate,
      systemPrompt: prompt
    })
    
    // Update system message in conversation
    const updatedConversation = [...conversation]
    updatedConversation[0] = {
      role: "system",
      content: prompt
    }
    setConversation(updatedConversation)
  }
  
  // Handle sending a test message
  const handleSendMessage = () => {
    if (!userMessage.trim()) return
    
    // Add user message to conversation
    const updatedConversation = [
      ...conversation,
      {
        role: "user",
        content: userMessage
      }
    ]
    setConversation(updatedConversation)
    setUserMessage("")
    
    // Simulate AI response generation
    setIsGenerating(true)
    setTimeout(() => {
      // In a real app, this would be an API call to the AI service
      const aiResponse = "Thank you for your message. As your AI assistant configured with the " + 
                        customizedTemplate.name + " personality, I'm here to help you with any questions or issues you have. " +
                        "Is there anything specific about our platform you'd like to know more about?";
      
      setConversation([
        ...updatedConversation,
        {
          role: "assistant",
          content: aiResponse
        }
      ])
      setIsGenerating(false)
    }, 1500)
  }
  
  // Handle saving template changes
  const handleSaveChanges = () => {
    setIsSaving(true)
    
    // In a real app, this would be an API call to save the template
    setTimeout(() => {
      setIsSaving(false)
      // Would show a success toast notification
      console.log("Changes saved successfully")
    }, 1000)
  }
  
  // Handle creating a new template
  const handleCreateTemplate = () => {
    // In a real app, this would be an API call to create a new template
    console.log("Creating new template:", newTemplateName, newTemplateCategory)
    setIsNewTemplateDialogOpen(false)
    setNewTemplateName("")
    // Would show a success toast notification
  }
  
  // Use a sample question
  const handleUseSampleQuestion = (question: string) => {
    setUserMessage(question)
  }
  
  // Reset to original template
  const handleResetTemplate = () => {
    setCustomizedTemplate(selectedTemplate)
    
    // Reset conversation
    const updatedConversation = [
      {
        role: "system",
        content: selectedTemplate.systemPrompt
      },
      {
        role: "assistant",
        content: "Hello! I'm your AI assistant. How can I help you today?"
      }
    ]
    setConversation(updatedConversation)
  }

  // Get trait keys for the selected template
  const getTraitKeys = () => {
    return Object.keys(customizedTemplate.traits)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Agent Personality Configuration</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleResetTemplate}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reset Changes
          </Button>
          <Button 
            onClick={handleSaveChanges}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Template Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Templates</CardTitle>
              <CardDescription>
                Select a base personality template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <Select 
                  value={selectedTemplate.id} 
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {agentTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="ghost" onClick={() => setIsNewTemplateDialogOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-1" />
                  New
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">{selectedTemplate.name}</div>
                <div className="text-sm text-muted-foreground">{selectedTemplate.description}</div>
                <div className="flex items-center mt-2">
                  <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-1">
                    {selectedTemplate.category}
                  </span>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="text-sm font-medium mb-2">Sample Questions</div>
                <div className="space-y-2">
                  {selectedTemplate.sampleQuestions.map((question, index) => (
                    <div 
                      key={index} 
                      className="text-sm p-2 rounded-md bg-muted hover:bg-muted/70 cursor-pointer flex justify-between items-center"
                      onClick={() => handleUseSampleQuestion(question)}
                    >
                      <span className="truncate">{question}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6">
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Personality Traits Card */}
          <Card>
            <CardHeader>
              <CardTitle>Personality Traits</CardTitle>
              <CardDescription>
                Adjust the agent's personality characteristics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <TooltipProvider>
                {getTraitKeys().map((trait) => (
                  <div key={trait} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Label className="flex items-center cursor-help">
                            {trait.charAt(0).toUpperCase() + trait.slice(1)}
                            <Sliders className="h-3 w-3 ml-1 text-muted-foreground" />
                          </Label>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{traitDescriptions[trait as keyof typeof traitDescriptions] || trait}</p>
                        </TooltipContent>
                      </Tooltip>
                      <span className="text-sm font-mono">
                        {customizedTemplate.traits[trait as keyof typeof customizedTemplate.traits]}%
                      </span>
                    </div>
                    <Slider
                      defaultValue={[customizedTemplate.traits[trait as keyof typeof customizedTemplate.traits]]}
                      max={100}
                      step={5}
                      onValueChange={(value) => handleTraitChange(trait, value)}
                    />
                  </div>
                ))}
              </TooltipProvider>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="system-prompt">
            <TabsList>
              <TabsTrigger value="system-prompt">System Prompt</TabsTrigger>
              <TabsTrigger value="test">Test Interaction</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="system-prompt" className="space-y-4 pt-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">System Prompt</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    navigator.clipboard.writeText(customizedTemplate.systemPrompt)
                    // Would show a toast notification
                  }}>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
              
              <Textarea
                value={customizedTemplate.systemPrompt}
                onChange={(e) => handleSystemPromptChange(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                placeholder="Enter system prompt instructions for the AI agent..."
              />
              
              <div className="bg-muted p-4 rounded-md">
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium">System Prompt Best Practices</h3>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1 list-disc list-inside">
                      <li>Begin with a clear role definition for the agent</li>
                      <li>Specify tone, style, and communication parameters</li>
                      <li>Include domain-specific knowledge and boundaries</li>
                      <li>Define how to handle sensitive or out-of-scope requests</li>
                      <li>Provide examples of ideal responses when possible</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="test" className="space-y-4 pt-4">
              <div className="border rounded-md h-[400px] flex flex-col">
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {conversation.slice(1).map((message, index) => (
                    <div 
                      key={index}
                      className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div 
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'assistant' 
                            ? 'bg-muted text-foreground' 
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.role === 'assistant' ? (
                            <>
                              <Bot className="h-4 w-4" />
                              <span className="text-xs font-medium">{customizedTemplate.name}</span>
                            </>
                          ) : (
                            <>
                              <UserCircle className="h-4 w-4" />
                              <span className="text-xs font-medium">You</span>
                            </>
                          )}
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isGenerating && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] p-3 rounded-lg bg-muted">
                        <div className="flex items-center gap-2 mb-1">
                          <Bot className="h-4 w-4" />
                          <span className="text-xs font-medium">{customizedTemplate.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150"></div>
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-300"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      placeholder="Type a message to test the agent..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      disabled={isGenerating}
                    />
                    <Button onClick={handleSendMessage} disabled={isGenerating || !userMessage.trim()}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-medium">
                    This is a test interface to preview agent responses. In production, responses will be generated using the configured AI model.
                  </span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4 pt-4">
              <Accordion type="single" collapsible>
                <AccordionItem value="response-settings">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <Settings2 className="h-4 w-4 mr-2" />
                      Response Settings
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Temperature</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            defaultValue={[0.7]}
                            max={1}
                            step={0.1}
                            className="flex-1"
                          />
                          <span className="text-sm font-mono w-8">0.7</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Controls randomness: Lower values are more deterministic, higher values more creative
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Response Length</Label>
                        <Select defaultValue="medium">
                          <SelectTrigger>
                            <SelectValue placeholder="Select length" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="concise">Concise</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="detailed">Detailed</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Preferred length of responses from this agent
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Knowledge Cutoff</Label>
                        <Select defaultValue="latest">
                          <SelectTrigger>
                            <SelectValue placeholder="Select cutoff" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="latest">Latest Available</SelectItem>
                            <SelectItem value="2023">End of 2023</SelectItem>
                            <SelectItem value="2022">End of 2022</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Knowledge cutoff date for the agent's responses
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Tone Consistency</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            defaultValue={[85]}
                            max={100}
                            step={5}
                            className="flex-1"
                          />
                          <span className="text-sm font-mono w-8">85%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          How consistently the agent maintains its personality tone
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="content-filtering">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Content Filtering
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">Sensitive Topics Handling</h4>
                          <p className="text-xs text-muted-foreground">
                            How to handle questions about sensitive topics
                          </p>
                        </div>
                        <Select defaultValue="redirect">
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select handling" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="decline">Decline to answer</SelectItem>
                            <SelectItem value="redirect">Politely redirect</SelectItem>
                            <SelectItem value="limited">Provide limited information</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">Content Safety Level</h4>
                          <p className="text-xs text-muted-foreground">
                            Level of content filtering to apply
                          </p>
                        </div>
                        <Select defaultValue="standard">
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="strict">Strict</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="minimal">Minimal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">Off-Topic Handling</h4>
                          <p className="text-xs text-muted-foreground">
                            How to handle questions unrelated to the platform
                          </p>
                        </div>
                        <Select defaultValue="refocus">
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select handling" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="decline">Decline to answer</SelectItem>
                            <SelectItem value="refocus">Refocus to platform</SelectItem>
                            <SelectItem value="limited">Answer with limitations</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="context-memory">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <Bot className="h-4 w-4 mr-2" />
                      Memory & Context
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">Conversation Memory</h4>
                          <p className="text-xs text-muted-foreground">
                            How many previous messages to remember
                          </p>
                        </div>
                        <Select defaultValue="20">
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select count" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">Last 5 messages</SelectItem>
                            <SelectItem value="10">Last 10 messages</SelectItem>
                            <SelectItem value="20">Last 20 messages</SelectItem>
                            <SelectItem value="50">Last 50 messages</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">Long-Term Memory</h4>
                          <p className="text-xs text-muted-foreground">
                            Remember user information across sessions
                          </p>
                        </div>
                        <div className="flex items-center h-6">
                          <Checkbox id="long-term-memory" defaultChecked />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">Context Enhancement</h4>
                          <p className="text-xs text-muted-foreground">
                            Automatically include relevant knowledge base articles
                          </p>
                        </div>
                        <div className="flex items-center h-6">
                          <Checkbox id="context-enhancement" defaultChecked />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">User Data Access</h4>
                          <p className="text-xs text-muted-foreground">
                            Allow access to user account and usage data
                          </p>
                        </div>
                        <div className="flex items-center h-6">
                          <Checkbox id="user-data-access" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
          </Tabs>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>API Access</CardTitle>
              <CardDescription>
                Access this agent's configuration via API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Agent ID</div>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      {customizedTemplate.id}
                    </code>
                    <Button size="icon" variant="ghost" className="h-6 w-6">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">API Endpoint</div>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      /api/v1/agents/{customizedTemplate.id}
                    </code>
                    <Button size="icon" variant="ghost" className="h-6 w-6">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Example API Usage</h4>
                <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`fetch('/api/v1/agents/${customizedTemplate.id}/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: "Hello, how can you help me?" })
})
.then(response => response.json())
.then(data => console.log(data))`}
                </pre>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" size="sm" asChild className="w-full">
                <a href="#" target="_blank" rel="noopener noreferrer">
                  View Full API Documentation
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* New Template Dialog */}
      <Dialog open={isNewTemplateDialogOpen} onOpenChange={setIsNewTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Agent Template</DialogTitle>
            <DialogDescription>
              Create a new personality template for your AI agents
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input 
                id="template-name" 
                placeholder="e.g., Technical Support Specialist" 
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-category">Category</Label>
              <Select 
                value={newTemplateCategory} 
                onValueChange={setNewTemplateCategory}
              >
                <SelectTrigger id="template-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="support">Customer Support</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-description">Description</Label>
              <Textarea 
                id="template-description" 
                placeholder="Briefly describe this agent's purpose and personality..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTemplate} 
              disabled={!newTemplateName.trim()}
            >
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
"""
Base Executive Agent
-------------------
Defines the core structure and functionality for all executive agents in the platform.
"""

import json
from abc import ABC, abstractmethod
from enum import Enum
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Literal, TypedDict
from datetime import datetime


class DecisionConfidence(Enum):
    """Levels of confidence in a decision or recommendation."""
    VERY_LOW = 1
    LOW = 2
    MODERATE = 3
    HIGH = 4
    VERY_HIGH = 5


class StakeholderImpact(BaseModel):
    """Impact of a decision on a specific stakeholder group."""
    stakeholder_group: str
    impact_level: Literal["negative", "neutral", "positive", "mixed"]
    impact_description: str
    confidence: DecisionConfidence
    mitigation_strategies: Optional[List[str]] = None


class RiskAssessment(BaseModel):
    """Risk assessment for a recommendation or decision."""
    risk_category: str  # e.g., "financial", "reputational", "operational", "compliance"
    likelihood: DecisionConfidence
    impact: DecisionConfidence
    risk_description: str
    mitigation_strategies: List[str]


class RecommendationAlternative(BaseModel):
    """Alternative option considered but not selected as primary recommendation."""
    title: str
    description: str
    strengths: List[str]
    weaknesses: List[str]
    why_not_selected: str


class ExecutiveRecommendation(BaseModel):
    """A formal recommendation from an executive agent."""
    title: str = Field(..., description="Concise title of the recommendation")
    summary: str = Field(..., description="Brief executive summary")
    detailed_description: str = Field(..., description="Complete description of the recommendation")
    supporting_evidence: List[str] = Field(..., description="Evidence supporting this recommendation")
    confidence: DecisionConfidence = Field(..., description="Confidence level in this recommendation")
    alternatives_considered: List[RecommendationAlternative] = Field(
        default_factory=list, 
        description="Alternative options that were considered"
    )
    risks: List[RiskAssessment] = Field(
        default_factory=list, 
        description="Risks associated with this recommendation"
    )
    stakeholder_impacts: List[StakeholderImpact] = Field(
        default_factory=list, 
        description="Impact on various stakeholders"
    )
    resource_requirements: Dict[str, Any] = Field(
        default_factory=dict, 
        description="Resources required to implement this recommendation"
    )
    implementation_timeline: Optional[Dict[str, Any]] = Field(
        default=None, 
        description="Timeline for implementation"
    )
    success_metrics: List[str] = Field(
        default_factory=list, 
        description="Metrics to evaluate success"
    )
    domain_specific_analyses: Dict[str, Any] = Field(
        default_factory=dict, 
        description="Domain-specific analyses relevant to this executive's expertise"
    )
    uncertainty_factors: List[str] = Field(
        default_factory=list, 
        description="Factors contributing to uncertainty"
    )
    framework_used: str = Field(
        default="", 
        description="Decision framework used to arrive at this recommendation"
    )


class ExpertiseLevel(Enum):
    """Levels of expertise in different domains."""
    NOVICE = 1
    BASIC = 2
    PROFICIENT = 3
    ADVANCED = 4
    EXPERT = 5


class ExecutiveContext(TypedDict):
    """Context for executive decision-making."""
    query: str
    background_information: Dict[str, Any]
    constraints: List[str]
    available_data: Dict[str, Any]
    previous_decisions: Dict[str, Any]
    organizational_priorities: List[str]
    relevant_metrics: Dict[str, Any]


class BaseExecutive(ABC):
    """
    Abstract base class for all executive agents.
    
    Provides common functionality and required interface methods that all
    specialized executive agents must implement.
    """
    
    def __init__(self, name: str, role: str, expertise_domains: Dict[str, ExpertiseLevel]):
        """
        Initialize the executive agent.
        
        Args:
            name: Name identifier for this executive
            role: Role title (e.g., "Chief Strategy Officer")
            expertise_domains: Dictionary mapping domains of expertise to expertise levels
        """
        self.name = name
        self.role = role
        self.expertise_domains = expertise_domains
        self.decision_history = []
        self.created_at = datetime.now()
    
    @property
    def executive_profile(self) -> Dict[str, Any]:
        """Return a profile of this executive agent."""
        return {
            "name": self.name,
            "role": self.role,
            "expertise_domains": {domain: level.name for domain, level in self.expertise_domains.items()},
            "decisions_made": len(self.decision_history),
            "created_at": self.created_at.isoformat()
        }
    
    def log_decision(self, context: ExecutiveContext, recommendation: ExecutiveRecommendation):
        """
        Log a decision or recommendation made by this executive.
        
        Args:
            context: The context in which the decision was made
            recommendation: The recommendation that was produced
        """
        decision_record = {
            "timestamp": datetime.now().isoformat(),
            "context": context,
            "recommendation": recommendation.model_dump(),
        }
        self.decision_history.append(decision_record)
        return decision_record
    
    @abstractmethod
    async def analyze(self, context: ExecutiveContext) -> ExecutiveRecommendation:
        """
        Analyze the given context and produce a recommendation.
        
        Args:
            context: All relevant context for making a decision
            
        Returns:
            An executive recommendation based on analysis
        """
        pass
    
    @abstractmethod
    async def evaluate_recommendation(self, recommendation: ExecutiveRecommendation) -> Dict[str, Any]:
        """
        Evaluate a recommendation made by another executive from this executive's perspective.
        
        Args:
            recommendation: The recommendation to evaluate
            
        Returns:
            Evaluation results including agreement level, concerns, and suggested modifications
        """
        pass
    
    @abstractmethod
    async def integrate_feedback(self, recommendation: ExecutiveRecommendation, feedback: List[Dict[str, Any]]) -> ExecutiveRecommendation:
        """
        Integrate feedback from other executives to improve a recommendation.
        
        Args:
            recommendation: The original recommendation
            feedback: Feedback from other executives
            
        Returns:
            An updated recommendation incorporating the feedback
        """
        pass
    
    def __str__(self) -> str:
        return f"{self.name} ({self.role})"

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} name='{self.name}' role='{self.role}'>"
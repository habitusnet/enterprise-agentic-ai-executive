"""
Base Decision Framework
----------------------
Defines the foundational structure for all decision frameworks in the platform.
"""

from abc import ABC, abstractmethod
from enum import Enum
from typing import Dict, List, Any, Optional, TypedDict, Union
from pydantic import BaseModel, Field


class DecisionContext(TypedDict):
    """Context provided for decision-making."""
    problem_statement: str
    alternatives: List[Dict[str, Any]]  # List of alternative options
    constraints: List[str]  # Limitations and boundaries
    organizational_values: Dict[str, float]  # Values and their weights
    available_data: Dict[str, Any]  # Data available for decision-making
    stakeholders: List[str]  # Relevant stakeholders
    previous_decisions: Optional[List[Dict[str, Any]]] = None  # Related historical decisions
    domain_specific_context: Optional[Dict[str, Any]] = None  # Domain-specific information


class DecisionRecommendation(BaseModel):
    """Result of applying a decision framework."""
    recommended_alternative: Dict[str, Any] = Field(..., description="The recommended alternative")
    reasoning: str = Field(..., description="Detailed reasoning for the recommendation")
    confidence_level: float = Field(..., ge=0.0, le=1.0, description="Confidence in this recommendation (0-1)")
    key_factors: List[str] = Field(..., description="Key factors that influenced the decision")
    trade_offs: List[str] = Field(default_factory=list, description="Key trade-offs considered")
    risks: List[Dict[str, Any]] = Field(default_factory=list, description="Identified risks")
    assumptions: List[str] = Field(default_factory=list, description="Assumptions made")
    framework_specific_outputs: Dict[str, Any] = Field(default_factory=dict, description="Framework-specific analysis details")
    rejected_alternatives: List[Dict[str, Any]] = Field(default_factory=list, description="Alternatives that were rejected")


class UncertaintyType(Enum):
    """Types of uncertainty in decision-making."""
    STATISTICAL = "statistical"  # Known probabilities
    SCENARIO = "scenario"  # Known possible outcomes but unknown probabilities
    RECOGNIZED_IGNORANCE = "recognized_ignorance"  # Known unknowns
    TOTAL_IGNORANCE = "total_ignorance"  # Unknown unknowns


class ComplexityLevel(Enum):
    """Levels of decision complexity."""
    SIMPLE = "simple"  # Clear cause-effect, established practices apply
    COMPLICATED = "complicated"  # Multiple factors but analyzable
    COMPLEX = "complex"  # Emergent patterns, unpredictable interactions
    CHAOTIC = "chaotic"  # No clear patterns, rapid change


class BaseDecisionFramework(ABC):
    """
    Abstract base class for all decision frameworks.
    
    Provides the common interface that all framework implementations must follow.
    """
    
    def __init__(self, name: str, description: str):
        """
        Initialize the decision framework.
        
        Args:
            name: Name of the framework
            description: Description of the framework's purpose and approach
        """
        self.name = name
        self.description = description
    
    @property
    def framework_info(self) -> Dict[str, str]:
        """Return information about this framework."""
        return {
            "name": self.name,
            "description": self.description,
            "class": self.__class__.__name__
        }
    
    @abstractmethod
    async def apply(self, context: DecisionContext) -> DecisionRecommendation:
        """
        Apply the decision framework to the given context.
        
        Args:
            context: All relevant context for making a decision
            
        Returns:
            A decision recommendation based on the framework's methodology
        """
        pass
    
    @abstractmethod
    def get_required_inputs(self) -> Dict[str, str]:
        """
        Get information about the inputs required by this framework.
        
        Returns:
            Dictionary mapping input names to descriptions of what's needed
        """
        pass
    
    @abstractmethod
    def evaluate_applicability(self, context: DecisionContext) -> Dict[str, Any]:
        """
        Evaluate how applicable this framework is to the given context.
        
        Args:
            context: Decision context to evaluate
            
        Returns:
            Assessment of applicability including score and explanation
        """
        pass
    
    def __str__(self) -> str:
        return f"{self.name} Decision Framework"

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} name='{self.name}'>"
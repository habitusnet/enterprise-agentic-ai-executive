"""
Executive Template Manager
-------------------------
This module provides tools for managing executive templates and configuring
executive teams based on predefined or custom templates.
"""

import os
import json
import logging
from enum import Enum
from typing import Dict, List, Any, Optional, Union, Set
from pydantic import BaseModel, Field, validator

from src.executive_agents.base_executive import ExpertiseLevel, BaseExecutive
from src.executive_agents.strategy_executive import StrategyExecutive
from src.executive_agents.risk_executive import RiskExecutive
# Import other executive types as they are implemented


class DecisionStyle(str, Enum):
    """Decision-making styles for executives."""
    ANALYTICAL = "analytical"
    INTUITIVE = "intuitive"
    COLLABORATIVE = "collaborative"
    DIRECTIVE = "directive"
    FLEXIBLE = "flexible"


class RiskTolerance(str, Enum):
    """Risk tolerance levels for executives."""
    VERY_LOW = "very_low"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"
    

class TimeOrientation(str, Enum):
    """Time horizon orientation for executives."""
    SHORT_TERM = "short_term"
    MEDIUM_TERM = "medium_term"
    LONG_TERM = "long_term"
    MULTI_HORIZON = "multi_horizon"


class ExecutiveAttributes(BaseModel):
    """Configurable attributes for executive agents."""
    decision_style: Optional[DecisionStyle] = None
    risk_tolerance: Optional[RiskTolerance] = None
    time_orientation: Optional[TimeOrientation] = None
    value_priorities: Optional[List[str]] = None
    industry_experience: Optional[List[str]] = None
    communication_style: Optional[str] = None
    

class ExecutiveTemplate(BaseModel):
    """Template for creating executive agents."""
    template_id: str = Field(..., description="Unique identifier for this template")
    base_role: str = Field(..., description="Base executive role (e.g., 'Chief Strategy Officer')")
    name: str = Field(..., description="Display name for the executive")
    description: str = Field(..., description="Description of the executive's approach and focus")
    expertise_domains: Dict[str, str] = Field(..., description="Mapping of domains to expertise levels")
    attributes: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional executive attributes")
    
    @validator('expertise_domains')
    def validate_expertise_levels(cls, v):
        """Validate that expertise levels are valid enum values."""
        valid_levels = set(level.name for level in ExpertiseLevel)
        for domain, level in v.items():
            if level not in valid_levels:
                raise ValueError(f"Invalid expertise level '{level}' for domain '{domain}'. "
                               f"Must be one of: {', '.join(valid_levels)}")
        return v


class TemplateCollection(BaseModel):
    """Collection of executive templates."""
    executive_templates: Dict[str, ExecutiveTemplate] = Field(
        default_factory=dict,
        description="Dictionary mapping template IDs to template definitions"
    )


class ExecutiveTeamTemplate(BaseModel):
    """Template for a complete executive team configuration."""
    template_id: str = Field(..., description="Unique identifier for this team template")
    name: str = Field(..., description="Name of this team template")
    description: str = Field(..., description="Description of this team configuration")
    executives: List[str] = Field(..., description="List of executive template IDs to include")
    custom_expertise_overrides: Optional[Dict[str, Dict[str, str]]] = Field(
        default_factory=dict,
        description="Optional overrides for expertise levels by executive"
    )
    custom_attribute_overrides: Optional[Dict[str, Dict[str, Any]]] = Field(
        default_factory=dict,
        description="Optional overrides for attributes by executive"
    )


class TeamTemplateCollection(BaseModel):
    """Collection of executive team templates."""
    team_templates: Dict[str, ExecutiveTeamTemplate] = Field(
        default_factory=dict,
        description="Dictionary mapping team template IDs to team template definitions"
    )


class TemplateManager:
    """
    Manages the loading, saving, and application of executive templates.
    
    This class handles loading template definitions from configuration files,
    creating executive instances based on templates, and saving custom templates.
    """
    
    def __init__(self, templates_dir: str = None):
        """
        Initialize the template manager.
        
        Args:
            templates_dir: Directory containing template configuration files
        """
        self.logger = logging.getLogger(__name__)
        self.templates_dir = templates_dir or os.path.join(os.path.dirname(__file__), "config")
        
        # Ensure templates directory exists
        os.makedirs(self.templates_dir, exist_ok=True)
        
        # Default templates file paths
        self.executive_templates_file = os.path.join(self.templates_dir, "executive_templates.json")
        self.team_templates_file = os.path.join(self.templates_dir, "team_templates.json")
        
        # Load templates
        self.executive_templates = self._load_executive_templates()
        self.team_templates = self._load_team_templates()
        
        # Map role names to executive classes
        self.role_class_map = {
            "Chief Strategy Officer": StrategyExecutive,
            "Chief Risk Officer": RiskExecutive,
            # Add other executive classes as they are implemented
        }
    
    def _load_executive_templates(self) -> TemplateCollection:
        """
        Load executive templates from the configuration file.
        
        Returns:
            Collection of executive templates
        """
        if not os.path.exists(self.executive_templates_file):
            self.logger.info(f"Executive templates file not found at {self.executive_templates_file}. Using defaults.")
            return TemplateCollection()
        
        try:
            with open(self.executive_templates_file, 'r') as f:
                data = json.load(f)
            return TemplateCollection.parse_obj(data)
        except Exception as e:
            self.logger.error(f"Error loading executive templates: {str(e)}")
            return TemplateCollection()
    
    def _load_team_templates(self) -> TeamTemplateCollection:
        """
        Load team templates from the configuration file.
        
        Returns:
            Collection of team templates
        """
        if not os.path.exists(self.team_templates_file):
            self.logger.info(f"Team templates file not found at {self.team_templates_file}. Using defaults.")
            return TeamTemplateCollection()
        
        try:
            with open(self.team_templates_file, 'r') as f:
                data = json.load(f)
            return TeamTemplateCollection.parse_obj(data)
        except Exception as e:
            self.logger.error(f"Error loading team templates: {str(e)}")
            return TeamTemplateCollection()
    
    def get_available_templates(self) -> Dict[str, Dict[str, str]]:
        """
        Get a dictionary of available templates with key information.
        
        Returns:
            Dictionary mapping template IDs to template info (name, description, role)
        """
        return {
            template_id: {
                "name": template.name,
                "description": template.description,
                "base_role": template.base_role
            }
            for template_id, template in self.executive_templates.executive_templates.items()
        }
    
    def get_available_team_templates(self) -> Dict[str, Dict[str, str]]:
        """
        Get a dictionary of available team templates with key information.
        
        Returns:
            Dictionary mapping team template IDs to template info (name, description)
        """
        return {
            template_id: {
                "name": template.name,
                "description": template.description,
                "executive_count": len(template.executives)
            }
            for template_id, template in self.team_templates.team_templates.items()
        }
    
    def get_template_details(self, template_id: str) -> Optional[ExecutiveTemplate]:
        """
        Get detailed information about a specific template.
        
        Args:
            template_id: ID of the template to retrieve
            
        Returns:
            Template details or None if not found
        """
        return self.executive_templates.executive_templates.get(template_id)
    
    def create_executive_from_template(
        self,
        template_id: str,
        custom_name: Optional[str] = None,
        expertise_overrides: Optional[Dict[str, str]] = None,
        attribute_overrides: Optional[Dict[str, Any]] = None,
        model_provider: str = "OpenAI",
        model_name: str = "gpt-4o"
    ) -> Optional[BaseExecutive]:
        """
        Create an executive instance based on a template.
        
        Args:
            template_id: ID of the template to use
            custom_name: Optional custom name for the executive
            expertise_overrides: Optional overrides for expertise levels
            attribute_overrides: Optional overrides for attributes
            model_provider: LLM provider to use
            model_name: Specific model to use
            
        Returns:
            Instantiated executive or None if creation failed
        """
        # Get the template
        template = self.get_template_details(template_id)
        if not template:
            self.logger.error(f"Template '{template_id}' not found")
            return None
        
        # Get the appropriate executive class
        executive_class = self.role_class_map.get(template.base_role)
        if not executive_class:
            self.logger.error(f"No implementation found for role: {template.base_role}")
            return None
        
        # Prepare expertise domains dictionary
        expertise_domains = {}
        for domain, level_name in template.expertise_domains.items():
            try:
                # Override expertise level if specified
                if expertise_overrides and domain in expertise_overrides:
                    level_name = expertise_overrides[domain]
                
                # Convert string level name to enum value
                expertise_domains[domain] = ExpertiseLevel[level_name]
            except KeyError:
                self.logger.warning(f"Invalid expertise level '{level_name}' for domain '{domain}'")
                expertise_domains[domain] = ExpertiseLevel.BASIC
        
        # Create the executive instance
        name = custom_name or template.name
        try:
            executive = executive_class(
                name=name,
                model_provider=model_provider,
                model_name=model_name
            )
            
            # Apply expertise domains
            executive.expertise_domains = expertise_domains
            
            # Apply custom attributes if the executive class supports them
            if hasattr(executive, 'attributes') and template.attributes:
                # Start with template attributes
                attributes = template.attributes.copy()
                
                # Apply any overrides
                if attribute_overrides:
                    attributes.update(attribute_overrides)
                
                # Set attributes on the executive
                executive.attributes = attributes
                
            return executive
        except Exception as e:
            self.logger.error(f"Error creating executive from template: {str(e)}")
            return None
    
    def create_team_from_template(
        self,
        team_template_id: str,
        model_provider: str = "OpenAI",
        model_name: str = "gpt-4o"
    ) -> List[BaseExecutive]:
        """
        Create a team of executives based on a team template.
        
        Args:
            team_template_id: ID of the team template to use
            model_provider: LLM provider to use
            model_name: Specific model to use
            
        Returns:
            List of instantiated executives
        """
        # Get the team template
        team_template = self.team_templates.team_templates.get(team_template_id)
        if not team_template:
            self.logger.error(f"Team template '{team_template_id}' not found")
            return []
        
        executives = []
        for exec_template_id in team_template.executives:
            # Get any overrides for this executive
            expertise_overrides = team_template.custom_expertise_overrides.get(exec_template_id, {})
            attribute_overrides = team_template.custom_attribute_overrides.get(exec_template_id, {})
            
            # Create the executive
            executive = self.create_executive_from_template(
                template_id=exec_template_id,
                expertise_overrides=expertise_overrides,
                attribute_overrides=attribute_overrides,
                model_provider=model_provider,
                model_name=model_name
            )
            
            if executive:
                executives.append(executive)
        
        return executives
    
    def save_custom_template(self, template: ExecutiveTemplate) -> bool:
        """
        Save a custom executive template.
        
        Args:
            template: The template to save
            
        Returns:
            True if saved successfully, False otherwise
        """
        try:
            # Add to templates
            self.executive_templates.executive_templates[template.template_id] = template
            
            # Save to file
            with open(self.executive_templates_file, 'w') as f:
                json.dump(self.executive_templates.dict(), f, indent=2)
            
            return True
        except Exception as e:
            self.logger.error(f"Error saving custom template: {str(e)}")
            return False
    
    def save_team_template(self, team_template: ExecutiveTeamTemplate) -> bool:
        """
        Save a custom team template.
        
        Args:
            team_template: The team template to save
            
        Returns:
            True if saved successfully, False otherwise
        """
        try:
            # Add to team templates
            self.team_templates.team_templates[team_template.template_id] = team_template
            
            # Save to file
            with open(self.team_templates_file, 'w') as f:
                json.dump(self.team_templates.dict(), f, indent=2)
            
            return True
        except Exception as e:
            self.logger.error(f"Error saving team template: {str(e)}")
            return False
    
    def create_default_templates(self) -> None:
        """Create and save default templates if none exist."""
        # Check if we already have templates
        if self.executive_templates.executive_templates:
            return
        
        # Create default templates
        default_templates = {
            "visionary_strategist": ExecutiveTemplate(
                template_id="visionary_strategist",
                base_role="Chief Strategy Officer",
                name="Visionary Strategist",
                description="Forward-thinking, innovation-focused strategic leader",
                expertise_domains={
                    "strategic_planning": "EXPERT",
                    "competitive_analysis": "EXPERT",
                    "market_positioning": "EXPERT",
                    "business_model_innovation": "EXPERT",
                    "emerging_trends": "ADVANCED"
                },
                attributes={
                    "decision_style": "INTUITIVE",
                    "risk_tolerance": "HIGH",
                    "time_orientation": "LONG_TERM",
                    "value_priorities": ["Innovation", "Growth", "Differentiation"]
                }
            ),
            "conservative_guardian": ExecutiveTemplate(
                template_id="conservative_guardian",
                base_role="Chief Risk Officer",
                name="Conservative Guardian",
                description="Highly cautious, protection-focused risk leader",
                expertise_domains={
                    "risk_assessment": "EXPERT",
                    "compliance": "EXPERT", 
                    "controls_design": "EXPERT",
                    "scenario_planning": "ADVANCED",
                    "crisis_management": "ADVANCED"
                },
                attributes={
                    "decision_style": "ANALYTICAL",
                    "risk_tolerance": "LOW",
                    "time_orientation": "MEDIUM_TERM",
                    "value_priorities": ["Security", "Stability", "Compliance"]
                }
            )
        }
        
        # Add to templates
        for template_id, template in default_templates.items():
            self.executive_templates.executive_templates[template_id] = template
        
        # Save to file
        with open(self.executive_templates_file, 'w') as f:
            json.dump(self.executive_templates.dict(), f, indent=2)
        
        # Create a default team template
        balanced_team = ExecutiveTeamTemplate(
            template_id="balanced_executive_team",
            name="Balanced Executive Team",
            description="A balanced team with strategic vision and risk awareness",
            executives=["visionary_strategist", "conservative_guardian"]
        )
        
        self.team_templates.team_templates["balanced_executive_team"] = balanced_team
        
        # Save to file
        with open(self.team_templates_file, 'w') as f:
            json.dump(self.team_templates.dict(), f, indent=2)
        
        self.logger.info("Created default executive and team templates")
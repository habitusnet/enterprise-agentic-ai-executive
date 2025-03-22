"""
Executive Team Orchestrator
--------------------------
Central orchestration module for coordinating AI executive agents, decision frameworks,
and consensus building.
"""

import logging
import asyncio
from typing import Dict, List, Any, Optional, Union, TypedDict
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

from src.executive_agents.base_executive import (
    BaseExecutive,
    ExecutiveRecommendation,
    ExecutiveContext,
    DecisionConfidence
)
from src.decision_frameworks.base_framework import (
    BaseDecisionFramework,
    DecisionContext,
    ComplexityLevel,
    UncertaintyType
)
from src.consensus.consensus_builder import (
    ConsensusBuilder,
    ConsensusEvaluation,
    ConsensusOutcome,
    DecisionParticipation
)


class DecisionRequest(BaseModel):
    """Request for a decision from the executive team."""
    query: str = Field(..., description="The decision query or question")
    context: Dict[str, Any] = Field(..., description="Relevant context information")
    constraints: List[str] = Field(default_factory=list, description="Constraints on the decision")
    required_domains: List[str] = Field(default_factory=list, description="Domains that must be considered")
    urgency: int = Field(1, ge=1, le=5, description="Urgency level (1-5)")
    importance: int = Field(1, ge=1, le=5, description="Importance level (1-5)")
    complexity_level: Optional[ComplexityLevel] = Field(None, description="Optional complexity classification")
    uncertainty_types: List[UncertaintyType] = Field(default_factory=list, description="Types of uncertainty present")
    deadline: Optional[datetime] = Field(None, description="When the decision is needed by")
    decision_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique identifier for this decision")


class TeamMember(TypedDict):
    """Information about an executive team member."""
    executive: BaseExecutive
    role_priority: Dict[str, int]  # Maps decision domains to priority level for this executive
    veto_rights: List[str]  # Domains where this executive has veto authority
    is_active: bool


class ExecutiveTeamConfig(BaseModel):
    """Configuration for the executive team."""
    consensus_threshold: float = Field(0.7, ge=0.0, le=1.0, description="Threshold for consensus")
    min_executive_participation: float = Field(0.6, ge=0.0, le=1.0, description="Minimum required participation")
    default_decision_framework: str = Field("bayesian", description="Default framework to use")
    max_resolution_attempts: int = Field(3, ge=1, description="Maximum attempts to resolve conflicts")
    human_escalation_threshold: float = Field(0.3, ge=0.0, le=1.0, description="Support threshold requiring escalation")
    enable_veto: bool = Field(True, description="Whether executives can veto in their domain")
    log_decisions: bool = Field(True, description="Whether to log decision history")
    auto_select_framework: bool = Field(True, description="Automatically select best framework")


class DecisionOutcome(BaseModel):
    """Complete outcome of a decision process."""
    decision_id: str
    query: str
    recommendation: ExecutiveRecommendation
    consensus: ConsensusOutcome
    participating_executives: List[str]
    selected_framework: str
    resolution_attempts: int = 1
    decision_request: DecisionRequest
    escalated_to_human: bool = False
    human_feedback: Optional[Dict[str, Any]] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    decision_metrics: Dict[str, Any] = Field(default_factory=dict)


class ExecutiveTeamOrchestrator:
    """
    Orchestrates interactions between executive agents, decision frameworks, and consensus building.
    
    Serves as the central coordination point for the AI executive team, managing the flow
    of information, selection of appropriate decision frameworks, coordination of executive
    input, and facilitation of consensus building.
    """
    
    def __init__(self, config: ExecutiveTeamConfig = None):
        """
        Initialize the executive team orchestrator.
        
        Args:
            config: Configuration settings for the executive team
        """
        self.config = config or ExecutiveTeamConfig()
        self.logger = logging.getLogger(__name__)
        self.executives: Dict[str, TeamMember] = {}
        self.frameworks: Dict[str, BaseDecisionFramework] = {}
        self.consensus_builder = ConsensusBuilder(
            consensus_threshold=self.config.consensus_threshold,
            min_participation=self.config.min_executive_participation
        )
        self.decision_history: List[DecisionOutcome] = []
    
    def register_executive(
        self,
        executive: BaseExecutive,
        role_priority: Dict[str, int],
        veto_rights: List[str] = None
    ) -> None:
        """
        Register an executive agent with the team.
        
        Args:
            executive: The executive agent to register
            role_priority: Dictionary mapping decision domains to priority level for this executive
            veto_rights: Optional list of domains where this executive has veto authority
        """
        self.executives[executive.name] = {
            "executive": executive,
            "role_priority": role_priority,
            "veto_rights": veto_rights or [],
            "is_active": True
        }
        self.logger.info(f"Registered executive: {executive.name} ({executive.role})")
    
    def register_framework(self, framework: BaseDecisionFramework) -> None:
        """
        Register a decision framework with the orchestrator.
        
        Args:
            framework: The decision framework to register
        """
        self.frameworks[framework.name.lower().replace(" ", "_")] = framework
        self.logger.info(f"Registered decision framework: {framework.name}")
    
    def deactivate_executive(self, executive_name: str) -> bool:
        """
        Temporarily deactivate an executive from the team.
        
        Args:
            executive_name: Name of the executive to deactivate
            
        Returns:
            True if successful, False if executive not found
        """
        if executive_name in self.executives:
            self.executives[executive_name]["is_active"] = False
            self.logger.info(f"Deactivated executive: {executive_name}")
            return True
        return False
    
    def reactivate_executive(self, executive_name: str) -> bool:
        """
        Reactivate a previously deactivated executive.
        
        Args:
            executive_name: Name of the executive to reactivate
            
        Returns:
            True if successful, False if executive not found
        """
        if executive_name in self.executives:
            self.executives[executive_name]["is_active"] = True
            self.logger.info(f"Reactivated executive: {executive_name}")
            return True
        return False
    
    def get_active_executives(self) -> List[BaseExecutive]:
        """
        Get all currently active executives.
        
        Returns:
            List of active executive agents
        """
        return [member["executive"] for member in self.executives.values() if member["is_active"]]
    
    async def make_decision(self, request: DecisionRequest) -> DecisionOutcome:
        """
        Orchestrate the full decision-making process.
        
        Args:
            request: Decision request with query and context
            
        Returns:
            Complete decision outcome
        """
        self.logger.info(f"Starting decision process for: {request.query}")
        
        # 1. Select relevant executives based on the decision domains
        selected_executives = self._select_relevant_executives(request)
        
        # 2. Choose appropriate decision framework
        framework_name = self._select_decision_framework(request)
        framework = self.frameworks.get(framework_name, next(iter(self.frameworks.values())))
        
        # 3. Prepare contexts
        executive_context = self._prepare_executive_context(request)
        decision_context = self._prepare_decision_context(request)
        
        # 4. Get primary recommendation from lead executive
        lead_executive = self._determine_lead_executive(selected_executives, request)
        primary_recommendation = await lead_executive.analyze(executive_context)
        
        # 5. Gather evaluations from other executives
        evaluations = await self._gather_evaluations(primary_recommendation, selected_executives, lead_executive, executive_context)
        
        # 6. Build consensus
        participating_execs = self._create_participation_records(selected_executives, lead_executive, request)
        
        consensus_outcome = await self.consensus_builder.build_consensus(
            recommendation=primary_recommendation,
            executive_evaluations=evaluations,
            decision_context=decision_context,
            participating_executives=participating_execs
        )
        
        # 7. Resolve conflicts if needed
        resolution_attempts = 1
        human_escalated = False
        
        while (consensus_outcome.consensus_level.value in ["divided_opinion", "strong_disagreement"] and 
               resolution_attempts < self.config.max_resolution_attempts):
            self.logger.info(f"Decision requires resolution attempt {resolution_attempts+1}")
            
            # Update recommendation based on feedback
            updated_recommendation = await lead_executive.integrate_feedback(
                primary_recommendation, 
                [e.model_dump() for e in evaluations]
            )
            
            # Re-evaluate the updated recommendation
            evaluations = await self._gather_evaluations(updated_recommendation, selected_executives, lead_executive, executive_context)
            
            # Re-build consensus
            consensus_outcome = await self.consensus_builder.build_consensus(
                recommendation=updated_recommendation,
                executive_evaluations=evaluations,
                decision_context=decision_context,
                participating_executives=participating_execs
            )
            
            resolution_attempts += 1
        
        # 8. Check if we need human escalation
        if consensus_outcome.support_percentage < self.config.human_escalation_threshold:
            self.logger.warning(f"Decision requires human escalation due to low consensus: {consensus_outcome.support_percentage:.1%}")
            human_escalated = True
            # In a real implementation, this would trigger a human review process
        
        # 9. Check for executive vetos
        veto_result = self._check_for_vetos(consensus_outcome, evaluations)
        if veto_result["veto_applied"]:
            self.logger.warning(f"Decision vetoed by {veto_result['veto_executive']}")
            human_escalated = True
            # In a real implementation, this would trigger a human review process
        
        # 10. Create decision outcome
        decision_outcome = DecisionOutcome(
            decision_id=request.decision_id,
            query=request.query,
            recommendation=consensus_outcome.recommendation,
            consensus=consensus_outcome,
            participating_executives=[e["executive"].name for e in selected_executives],
            selected_framework=framework.name,
            resolution_attempts=resolution_attempts,
            decision_request=request,
            escalated_to_human=human_escalated,
            decision_metrics={
                "resolution_attempts": resolution_attempts,
                "final_support_percentage": consensus_outcome.support_percentage,
                "veto_applied": veto_result["veto_applied"],
                "executive_count": len(selected_executives),
                "framework": framework.name,
                "lead_executive": lead_executive.name
            }
        )
        
        # 11. Log decision if configured
        if self.config.log_decisions:
            self.decision_history.append(decision_outcome)
        
        return decision_outcome
    
    def _select_relevant_executives(self, request: DecisionRequest) -> List[Dict[str, Any]]:
        """
        Select the relevant executives for this decision.
        
        Args:
            request: The decision request
            
        Returns:
            List of selected executives with additional information
        """
        # Get domains from the request
        domains = set(request.required_domains)
        
        # If no domains specified, consider all domains
        if not domains:
            # Extract domains from context or use all executives
            return [
                {"executive": member["executive"], "priority": 5} 
                for member in self.executives.values() 
                if member["is_active"]
            ]
        
        # Select executives with relevant expertise
        selected = []
        for name, member in self.executives.items():
            if not member["is_active"]:
                continue
                
            # Calculate priority for this executive based on domain match
            max_priority = 0
            for domain in domains:
                if domain in member["role_priority"]:
                    max_priority = max(max_priority, member["role_priority"][domain])
            
            # Include executive if they have relevant expertise
            if max_priority > 0:
                selected.append({
                    "executive": member["executive"],
                    "priority": max_priority
                })
        
        # Sort by priority (highest first)
        selected.sort(key=lambda x: x["priority"], reverse=True)
        
        # Ensure we have at least one executive
        if not selected and self.executives:
            # Fall back to first active executive
            for member in self.executives.values():
                if member["is_active"]:
                    selected.append({
                        "executive": member["executive"],
                        "priority": 1
                    })
                    break
        
        return selected
    
    def _determine_lead_executive(self, selected_executives: List[Dict[str, Any]], request: DecisionRequest) -> BaseExecutive:
        """
        Determine which executive should take the lead on this decision.
        
        Args:
            selected_executives: List of selected executives with priority
            request: The decision request
            
        Returns:
            The lead executive for this decision
        """
        if not selected_executives:
            raise ValueError("No executives available for this decision")
        
        # Default to highest priority executive
        return selected_executives[0]["executive"]
    
    def _select_decision_framework(self, request: DecisionRequest) -> str:
        """
        Select the appropriate decision framework for this request.
        
        Args:
            request: The decision request
            
        Returns:
            Name of the selected framework
        """
        if not self.config.auto_select_framework:
            return self.config.default_decision_framework
        
        # In a full implementation, we would evaluate framework applicability
        # For now, we'll use a simple heuristic
        
        # If complexity is specified, select based on that
        if request.complexity_level:
            if request.complexity_level == ComplexityLevel.SIMPLE:
                return "eisenhower_matrix"
            elif request.complexity_level == ComplexityLevel.COMPLICATED:
                return "kepner_tregoe"
            elif request.complexity_level == ComplexityLevel.COMPLEX:
                return "cynefin"
            elif request.complexity_level == ComplexityLevel.CHAOTIC:
                return "ooda"
        
        # If high urgency, prefer faster frameworks
        if request.urgency >= 4:
            return "ooda"
        
        # If high importance, prefer more rigorous frameworks
        if request.importance >= 4:
            return "mcda"
        
        # Default to Bayesian for uncertainty
        if UncertaintyType.STATISTICAL in request.uncertainty_types:
            return "bayesian"
            
        # Fall back to default
        return self.config.default_decision_framework
    
    def _prepare_executive_context(self, request: DecisionRequest) -> ExecutiveContext:
        """
        Prepare the context for executive agents.
        
        Args:
            request: The decision request
            
        Returns:
            Context for executive decision-making
        """
        return {
            "query": request.query,
            "background_information": request.context,
            "constraints": request.constraints,
            "available_data": request.context.get("data", {}),
            "previous_decisions": {},  # In real implementation, would include relevant history
            "organizational_priorities": request.context.get("priorities", []),
            "relevant_metrics": request.context.get("metrics", {})
        }
    
    def _prepare_decision_context(self, request: DecisionRequest) -> DecisionContext:
        """
        Prepare the context for the decision framework.
        
        Args:
            request: The decision request
            
        Returns:
            Context for decision framework
        """
        return {
            "problem_statement": request.query,
            "alternatives": request.context.get("alternatives", []),
            "constraints": request.constraints,
            "organizational_values": request.context.get("values", {}),
            "available_data": request.context.get("data", {}),
            "stakeholders": request.context.get("stakeholders", []),
            "domain_specific_context": {
                "complexity_level": request.complexity_level.value if request.complexity_level else None,
                "uncertainty_types": [u.value for u in request.uncertainty_types],
                "urgency": request.urgency,
                "importance": request.importance
            }
        }
    
    async def _gather_evaluations(
        self,
        recommendation: ExecutiveRecommendation,
        selected_executives: List[Dict[str, Any]],
        lead_executive: BaseExecutive,
        context: ExecutiveContext
    ) -> List[ConsensusEvaluation]:
        """
        Gather evaluations from all selected executives except the lead.
        
        Args:
            recommendation: Recommendation to evaluate
            selected_executives: List of selected executives
            lead_executive: The executive who made the recommendation
            context: Executive context
            
        Returns:
            List of consensus evaluations
        """
        evaluations = []
        evaluation_tasks = []
        
        for exec_info in selected_executives:
            executive = exec_info["executive"]
            
            # Skip the lead executive who made the recommendation
            if executive.name == lead_executive.name:
                continue
            
            # Create task for getting evaluation
            task = self._get_executive_evaluation(executive, recommendation, context, exec_info["priority"])
            evaluation_tasks.append(task)
        
        # Wait for all evaluations
        if evaluation_tasks:
            gathered_evaluations = await asyncio.gather(*evaluation_tasks)
            evaluations.extend(gathered_evaluations)
        
        return evaluations
    
    async def _get_executive_evaluation(
        self,
        executive: BaseExecutive,
        recommendation: ExecutiveRecommendation,
        context: ExecutiveContext,
        priority: int
    ) -> ConsensusEvaluation:
        """
        Get an evaluation from a single executive.
        
        Args:
            executive: Executive to get evaluation from
            recommendation: Recommendation to evaluate
            context: Executive context
            priority: Executive's priority for this decision
            
        Returns:
            Consensus evaluation
        """
        # Get the evaluation from the executive
        evaluation_result = await executive.evaluate_recommendation(recommendation)
        
        # Calculate expertise level based on priority (0-1 scale)
        expertise_level = min(1.0, priority / 5.0)
        
        # Create a consensus evaluation
        return ConsensusEvaluation(
            recommendation_id=recommendation.title,  # Using title as ID
            evaluator_id=executive.name,
            evaluator_role=executive.role,
            agreement_level=evaluation_result.get("agreement_level", 0.5),
            concerns=evaluation_result.get("concerns", []),
            suggestions=evaluation_result.get("suggestions", []),
            supporting_arguments=evaluation_result.get("supporting_arguments", []),
            expertise_level=expertise_level,
            confidence=evaluation_result.get("confidence", 0.7)
        )
    
    def _create_participation_records(
        self, 
        selected_executives: List[Dict[str, Any]],
        lead_executive: BaseExecutive,
        request: DecisionRequest
    ) -> List[DecisionParticipation]:
        """
        Create participation records for all involved executives.
        
        Args:
            selected_executives: Selected executives with priority
            lead_executive: The lead executive
            request: Original decision request
            
        Returns:
            List of participation records
        """
        participation_records = []
        
        for exec_info in selected_executives:
            executive = exec_info["executive"]
            priority = exec_info["priority"]
            
            # Determine participation type
            if executive.name == lead_executive.name:
                participation_type = "recommender"
            else:
                participation_type = "reviewer"
            
            # Calculate contribution weight based on priority
            contribution_weight = min(1.0, priority / 5.0)
            
            # Adjust lead executive weight
            if participation_type == "recommender":
                contribution_weight = max(contribution_weight, 0.8)
            
            # Create participation record
            participation_records.append({
                "executive_id": executive.name,
                "executive_role": executive.role,
                "participation_type": participation_type,
                "contribution_weight": contribution_weight,
                "expertise_relevance": contribution_weight
            })
        
        return participation_records
    
    def _check_for_vetos(
        self,
        consensus_outcome: ConsensusOutcome,
        evaluations: List[ConsensusEvaluation]
    ) -> Dict[str, Any]:
        """
        Check if any executive with veto power is exercising it.
        
        Args:
            consensus_outcome: The consensus outcome
            evaluations: Executive evaluations
            
        Returns:
            Dictionary with veto information
        """
        if not self.config.enable_veto:
            return {"veto_applied": False}
        
        # Extract domains from the recommendation
        recommendation_domains = []
        if hasattr(consensus_outcome.recommendation, "domain_specific_analyses"):
            recommendation_domains = list(consensus_outcome.recommendation.domain_specific_analyses.keys())
        
        # Check each executive with veto rights
        for name, member in self.executives.items():
            if not member["is_active"]:
                continue
                
            # Check if this executive has veto rights in relevant domains
            has_veto_authority = False
            for domain in recommendation_domains:
                if domain in member["veto_rights"]:
                    has_veto_authority = True
                    break
            
            if not has_veto_authority:
                continue
                
            # Check if this executive strongly opposes the recommendation
            for evaluation in evaluations:
                if evaluation.evaluator_id == name and evaluation.agreement_level < 0.2:
                    return {
                        "veto_applied": True,
                        "veto_executive": name,
                        "veto_role": member["executive"].role,
                        "veto_domain": [domain for domain in recommendation_domains if domain in member["veto_rights"]][0],
                        "agreement_level": evaluation.agreement_level,
                        "concerns": evaluation.concerns
                    }
        
        return {"veto_applied": False}
    
    def get_decision_history(self) -> List[DecisionOutcome]:
        """
        Get the history of decisions made by the executive team.
        
        Returns:
            List of decision outcomes
        """
        return self.decision_history
    
    def get_executive_insights(self, executive_name: str = None) -> Dict[str, Any]:
        """
        Get insights about executive performance and patterns.
        
        Args:
            executive_name: Optional name to filter for a specific executive
            
        Returns:
            Dictionary of executive insights
        """
        if not self.decision_history:
            return {"message": "No decision history available"}
        
        # Filter for the specific executive if provided
        if executive_name:
            if executive_name not in self.executives:
                return {"error": f"Executive {executive_name} not found"}
            
            exec_decisions = [
                d for d in self.decision_history 
                if executive_name in d.participating_executives
            ]
            
            return {
                "executive": executive_name,
                "decisions_participated": len(exec_decisions),
                "lead_decisions": len([d for d in exec_decisions if d.decision_metrics.get("lead_executive") == executive_name]),
                "avg_support_percentage": sum(d.consensus.support_percentage for d in exec_decisions) / len(exec_decisions) if exec_decisions else 0,
                "decisions": [{"id": d.decision_id, "query": d.query, "timestamp": d.timestamp} for d in exec_decisions]
            }
        else:
            # Aggregate insights for all executives
            exec_insights = {}
            for name, member in self.executives.items():
                exec_decisions = [
                    d for d in self.decision_history 
                    if name in d.participating_executives
                ]
                
                exec_insights[name] = {
                    "role": member["executive"].role,
                    "decisions_participated": len(exec_decisions),
                    "lead_decisions": len([d for d in exec_decisions if d.decision_metrics.get("lead_executive") == name]),
                    "avg_support_percentage": sum(d.consensus.support_percentage for d in exec_decisions) / len(exec_decisions) if exec_decisions else 0
                }
            
            return {
                "total_decisions": len(self.decision_history),
                "executive_insights": exec_insights,
                "framework_usage": self._calculate_framework_usage()
            }
    
    def _calculate_framework_usage(self) -> Dict[str, int]:
        """
        Calculate how often each decision framework was used.
        
        Returns:
            Dictionary mapping framework names to usage counts
        """
        framework_counts = {}
        
        for decision in self.decision_history:
            framework = decision.selected_framework
            if framework in framework_counts:
                framework_counts[framework] += 1
            else:
                framework_counts[framework] = 1
        
        return framework_counts
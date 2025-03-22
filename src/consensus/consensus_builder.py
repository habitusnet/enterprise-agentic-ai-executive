"""
Consensus Builder
---------------
Facilitates consensus building and conflict resolution among executive agents.
"""

import logging
from enum import Enum
from typing import Dict, List, Any, Optional, Tuple, Union, TypedDict
from pydantic import BaseModel, Field
import numpy as np
from datetime import datetime

from src.executive_agents.base_executive import (
    ExecutiveRecommendation,
    DecisionConfidence
)


class ConsensusLevel(Enum):
    """Levels of consensus among executives."""
    STRONG_CONSENSUS = "strong_consensus"  # Near unanimous agreement
    GENERAL_CONSENSUS = "general_consensus"  # Strong majority agreement
    MAJORITY_AGREEMENT = "majority_agreement"  # Simple majority
    DIVIDED_OPINION = "divided_opinion"  # Significant division
    STRONG_DISAGREEMENT = "strong_disagreement"  # Fundamental conflicts


class ConflictType(Enum):
    """Types of conflicts that can arise during consensus building."""
    FACTUAL = "factual"  # Disagreement about facts
    INTERPRETIVE = "interpretive"  # Different interpretations of same data
    VALUES = "values"  # Different priorities or values
    STRATEGIC = "strategic"  # Different preferred approaches
    ROLE_BASED = "role_based"  # Conflicts arising from role perspectives
    RISK_ASSESSMENT = "risk_assessment"  # Different risk evaluations


class DecisionParticipation(TypedDict):
    """Record of an executive's participation in a decision."""
    executive_id: str
    executive_role: str
    participation_type: str  # "recommender", "reviewer", "contributor", etc.
    contribution_weight: float  # 0-1 influence weight
    expertise_relevance: float  # 0-1 relevance of expertise to decision


class ConsensusEvaluation(BaseModel):
    """Evaluation of an executive's position on a recommendation."""
    recommendation_id: str
    evaluator_id: str
    evaluator_role: str
    agreement_level: float = Field(..., ge=0.0, le=1.0, description="Agreement level (0-1)")
    concerns: List[str] = Field(default_factory=list, description="Specific concerns with the recommendation")
    suggestions: List[str] = Field(default_factory=list, description="Suggestions for improvement")
    supporting_arguments: List[str] = Field(default_factory=list, description="Arguments supporting this evaluation")
    expertise_level: float = Field(..., ge=0.0, le=1.0, description="Relevance of evaluator's expertise (0-1)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Evaluator's confidence in this assessment (0-1)")


class ConsensusOutcome(BaseModel):
    """Result of a consensus building process."""
    recommendation: ExecutiveRecommendation
    consensus_level: ConsensusLevel
    support_percentage: float = Field(..., ge=0.0, le=1.0, description="Weighted percentage of support")
    supporting_executives: List[str]
    opposing_executives: List[str]
    abstaining_executives: List[str]
    key_conflicts: List[Dict[str, Any]]
    resolution_method: str
    modified_from_original: bool = False
    modification_summary: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())


class ConflictResolutionMethod(Enum):
    """Methods for resolving conflicts between executives."""
    EVIDENCE_BASED = "evidence_based"  # Additional data to resolve factual disputes
    WEIGHTED_VOTING = "weighted_voting"  # Expertise-weighted voting
    DELPHI_METHOD = "delphi_method"  # Iterative anonymous feedback
    COMPROMISE = "compromise"  # Finding middle ground
    INTEGRATIVE = "integrative"  # Creative solution incorporating multiple viewpoints
    ESCALATION = "escalation"  # Escalation to human decision makers
    STRUCTURED_DEBATE = "structured_debate"  # Formal debate process
    DIALECTICAL_INQUIRY = "dialectical_inquiry"  # Thesis-antithesis-synthesis


class ConsensusBuilder:
    """
    Facilitates consensus building and conflict resolution among AI executives.
    
    Implements various methods for achieving agreement, detecting and resolving
    conflicts, and ensuring that decisions reflect appropriate input from relevant
    executives.
    """
    
    def __init__(
        self,
        consensus_threshold: float = 0.7,  # Support level required for consensus
        min_participation: float = 0.5,  # Minimum required participation from eligible executives
        automatic_resolution_threshold: float = 0.85  # Threshold above which conflicts are auto-resolved
    ):
        """
        Initialize the consensus builder.
        
        Args:
            consensus_threshold: Support level required to declare consensus (0-1)
            min_participation: Minimum participation level required from eligible executives (0-1)
            automatic_resolution_threshold: Threshold above which conflicts are automatically resolved
        """
        self.consensus_threshold = consensus_threshold
        self.min_participation = min_participation
        self.automatic_resolution_threshold = automatic_resolution_threshold
        self.logger = logging.getLogger(__name__)
        self.decision_history = []
    
    async def build_consensus(
        self,
        recommendation: ExecutiveRecommendation,
        executive_evaluations: List[ConsensusEvaluation],
        decision_context: Dict[str, Any],
        participating_executives: List[DecisionParticipation]
    ) -> ConsensusOutcome:
        """
        Build consensus around a recommendation using executive evaluations.
        
        Args:
            recommendation: The recommendation to evaluate
            executive_evaluations: Evaluations from different executives
            decision_context: Context of the decision
            participating_executives: Information about participating executives
            
        Returns:
            Consensus outcome including support level and any resolved conflicts
        """
        # Calculate initial consensus metrics
        support_metrics = self._calculate_support_metrics(executive_evaluations, participating_executives)
        
        # Identify conflicts
        conflicts = self._identify_conflicts(executive_evaluations)
        
        # Determine if we have sufficient consensus already
        if support_metrics['weighted_support'] >= self.consensus_threshold and not conflicts['critical_conflicts']:
            consensus_outcome = self._create_consensus_outcome(
                recommendation,
                support_metrics,
                conflicts,
                "Direct consensus without conflict resolution",
                False,
                None
            )
            self.decision_history.append(consensus_outcome.model_dump())
            return consensus_outcome
        
        # If we don't have consensus, attempt to resolve conflicts
        if conflicts['all_conflicts']:
            self.logger.info(f"Attempting to resolve {len(conflicts['all_conflicts'])} conflicts")
            
            # Determine resolution method based on conflict types
            resolution_method = self._select_resolution_method(conflicts)
            
            # Apply the resolution method
            modified_recommendation = await self._apply_resolution_method(
                resolution_method,
                recommendation,
                executive_evaluations,
                conflicts,
                decision_context
            )
            
            # Recalculate support with the modified recommendation
            # Note: In a real implementation, we would re-gather evaluations for the modified recommendation
            # For this prototype, we'll estimate the new support level
            estimated_new_support = self._estimate_new_support(
                support_metrics['weighted_support'],
                conflicts,
                resolution_method
            )
            
            # Create outcome with the modified recommendation
            consensus_outcome = ConsensusOutcome(
                recommendation=modified_recommendation,
                consensus_level=self._determine_consensus_level(estimated_new_support),
                support_percentage=estimated_new_support,
                supporting_executives=[e.evaluator_id for e in executive_evaluations if e.agreement_level > 0.6],
                opposing_executives=[e.evaluator_id for e in executive_evaluations if e.agreement_level < 0.4],
                abstaining_executives=[e.evaluator_id for e in executive_evaluations if 0.4 <= e.agreement_level <= 0.6],
                key_conflicts=conflicts['critical_conflicts'],
                resolution_method=resolution_method.value,
                modified_from_original=True,
                modification_summary=f"Recommendation modified using {resolution_method.value} resolution"
            )
        else:
            # No conflicts, but insufficient consensus - possibly abstentions or low participation
            consensus_outcome = self._create_consensus_outcome(
                recommendation,
                support_metrics,
                conflicts,
                "Insufficient consensus without specific conflicts",
                False,
                None
            )
        
        # Record the outcome in decision history
        self.decision_history.append(consensus_outcome.model_dump())
        
        return consensus_outcome
    
    def analyze_disagreement(
        self,
        executive_evaluations: List[ConsensusEvaluation]
    ) -> Dict[str, Any]:
        """
        Analyze the nature and extent of disagreement among executives.
        
        Args:
            executive_evaluations: Evaluations from different executives
            
        Returns:
            Analysis of disagreement patterns and underlying causes
        """
        if len(executive_evaluations) < 2:
            return {"analysis": "Insufficient evaluations for disagreement analysis"}
        
        # Extract agreement levels
        agreement_levels = [e.agreement_level for e in executive_evaluations]
        
        # Calculate basic statistics
        mean_agreement = np.mean(agreement_levels)
        std_agreement = np.std(agreement_levels)
        min_agreement = min(agreement_levels)
        max_agreement = max(agreement_levels)
        
        # Identify polarization
        polarization = self._calculate_polarization(agreement_levels)
        
        # Identify clusters of agreement/disagreement
        clusters = self._identify_opinion_clusters(executive_evaluations)
        
        # Analyze concerns by category
        concern_categories = self._categorize_concerns(executive_evaluations)
        
        # Determine if disagreement is role-based
        role_based_analysis = self._analyze_role_based_disagreement(executive_evaluations)
        
        return {
            "mean_agreement": mean_agreement,
            "agreement_std_dev": std_agreement,
            "agreement_range": max_agreement - min_agreement,
            "polarization_index": polarization,
            "opinion_clusters": clusters,
            "primary_concerns": concern_categories,
            "role_based_patterns": role_based_analysis,
            "disagreement_level": self._interpret_disagreement_level(mean_agreement, std_agreement, polarization)
        }
    
    def _calculate_support_metrics(
        self,
        evaluations: List[ConsensusEvaluation],
        participating_executives: List[DecisionParticipation]
    ) -> Dict[str, Any]:
        """
        Calculate metrics related to support level for a recommendation.
        
        Args:
            evaluations: Evaluations from executives
            participating_executives: Information about participating executives
            
        Returns:
            Dictionary of support metrics
        """
        if not evaluations:
            return {
                "weighted_support": 0.0,
                "unweighted_support": 0.0,
                "participation_rate": 0.0,
                "strong_support": 0,
                "moderate_support": 0,
                "neutral": 0,
                "moderate_opposition": 0,
                "strong_opposition": 0
            }
        
        # Count support levels
        strong_support = len([e for e in evaluations if e.agreement_level >= 0.8])
        moderate_support = len([e for e in evaluations if 0.6 <= e.agreement_level < 0.8])
        neutral = len([e for e in evaluations if 0.4 <= e.agreement_level < 0.6])
        moderate_opposition = len([e for e in evaluations if 0.2 <= e.agreement_level < 0.4])
        strong_opposition = len([e for e in evaluations if e.agreement_level < 0.2])
        
        # Calculate unweighted support
        total_evaluations = len(evaluations)
        unweighted_support = sum(e.agreement_level for e in evaluations) / total_evaluations if total_evaluations > 0 else 0
        
        # Calculate weighted support based on expertise and role relevance
        weighted_agreements = []
        total_weight = 0
        
        for evaluation in evaluations:
            # Find the participation info for this executive
            participation_info = next(
                (p for p in participating_executives if p['executive_id'] == evaluation.evaluator_id),
                None
            )
            
            if participation_info:
                # Weight combines expertise relevance and contribution weight
                weight = participation_info['expertise_relevance'] * participation_info['contribution_weight']
                weighted_agreements.append(evaluation.agreement_level * weight)
                total_weight += weight
        
        weighted_support = sum(weighted_agreements) / total_weight if total_weight > 0 else unweighted_support
        
        # Calculate participation rate
        expected_participation = len(participating_executives)
        participation_rate = total_evaluations / expected_participation if expected_participation > 0 else 1.0
        
        return {
            "weighted_support": weighted_support,
            "unweighted_support": unweighted_support,
            "participation_rate": participation_rate,
            "strong_support": strong_support,
            "moderate_support": moderate_support,
            "neutral": neutral,
            "moderate_opposition": moderate_opposition,
            "strong_opposition": strong_opposition
        }
    
    def _identify_conflicts(
        self,
        evaluations: List[ConsensusEvaluation]
    ) -> Dict[str, Any]:
        """
        Identify conflicts in executive evaluations.
        
        Args:
            evaluations: Evaluations from executives
            
        Returns:
            Dictionary containing identified conflicts
        """
        if len(evaluations) < 2:
            return {"all_conflicts": [], "critical_conflicts": []}
        
        conflicts = []
        critical_conflicts = []
        
        # Look for explicit concerns that appear repeatedly
        concern_count = {}
        for evaluation in evaluations:
            for concern in evaluation.concerns:
                concern_key = concern.lower()
                if concern_key in concern_count:
                    concern_count[concern_key]["count"] += 1
                    concern_count[concern_key]["evaluators"].append(evaluation.evaluator_id)
                else:
                    concern_count[concern_key] = {
                        "concern": concern,
                        "count": 1,
                        "evaluators": [evaluation.evaluator_id]
                    }
        
        # Identify frequently mentioned concerns
        frequent_concerns = [v for k, v in concern_count.items() if v["count"] > 1]
        for concern in frequent_concerns:
            conflict = {
                "type": "shared_concern",
                "description": concern["concern"],
                "affected_executives": concern["evaluators"],
                "severity": "medium" if concern["count"] > len(evaluations) / 3 else "low"
            }
            conflicts.append(conflict)
            if concern["count"] > len(evaluations) / 2:
                critical_conflicts.append(conflict)
        
        # Look for polarized opinions (high disagreement)
        supportive = [e for e in evaluations if e.agreement_level >= 0.7]
        opposing = [e for e in evaluations if e.agreement_level <= 0.3]
        
        if supportive and opposing:
            # We have both strong support and strong opposition
            polarization_conflict = {
                "type": "polarized_opinion",
                "description": "Significant divide between supporting and opposing executives",
                "supporting_executives": [e.evaluator_id for e in supportive],
                "opposing_executives": [e.evaluator_id for e in opposing],
                "severity": "high" if (len(supportive) > 1 and len(opposing) > 1) else "medium"
            }
            conflicts.append(polarization_conflict)
            if polarization_conflict["severity"] == "high":
                critical_conflicts.append(polarization_conflict)
        
        # Look for role-based conflicts (e.g., finance vs. ethics)
        role_conflicts = self._identify_role_conflicts(evaluations)
        conflicts.extend(role_conflicts)
        critical_conflicts.extend([c for c in role_conflicts if c.get("severity") == "high"])
        
        return {
            "all_conflicts": conflicts,
            "critical_conflicts": critical_conflicts
        }
    
    def _identify_role_conflicts(
        self,
        evaluations: List[ConsensusEvaluation]
    ) -> List[Dict[str, Any]]:
        """
        Identify conflicts that appear to be based on executive roles.
        
        Args:
            evaluations: Evaluations from executives
            
        Returns:
            List of identified role-based conflicts
        """
        role_conflicts = []
        
        # Group evaluations by role
        role_groups = {}
        for evaluation in evaluations:
            role = evaluation.evaluator_role
            if role not in role_groups:
                role_groups[role] = []
            role_groups[role].append(evaluation)
        
        # Check for systematic disagreement between roles
        if len(role_groups) > 1:
            for role1 in role_groups:
                avg_agreement1 = sum(e.agreement_level for e in role_groups[role1]) / len(role_groups[role1])
                
                for role2 in role_groups:
                    if role1 >= role2:  # Skip duplicates and self-comparison
                        continue
                    
                    avg_agreement2 = sum(e.agreement_level for e in role_groups[role2]) / len(role_groups[role2])
                    
                    # If there's a significant difference in agreement between roles
                    if abs(avg_agreement1 - avg_agreement2) > 0.4:
                        supporting_role = role1 if avg_agreement1 > avg_agreement2 else role2
                        opposing_role = role2 if avg_agreement1 > avg_agreement2 else role1
                        
                        conflict = {
                            "type": "role_based",
                            "description": f"Systematic disagreement between {supporting_role} and {opposing_role} roles",
                            "supporting_role": supporting_role,
                            "opposing_role": opposing_role,
                            "agreement_difference": abs(avg_agreement1 - avg_agreement2),
                            "severity": "high" if abs(avg_agreement1 - avg_agreement2) > 0.6 else "medium"
                        }
                        role_conflicts.append(conflict)
        
        return role_conflicts
    
    def _create_consensus_outcome(
        self,
        recommendation: ExecutiveRecommendation,
        support_metrics: Dict[str, Any],
        conflicts: Dict[str, Any],
        resolution_method_description: str,
        modified: bool,
        modification_summary: Optional[str]
    ) -> ConsensusOutcome:
        """
        Create a consensus outcome based on support metrics and conflict analysis.
        
        Args:
            recommendation: The recommendation being evaluated
            support_metrics: Metrics about support level
            conflicts: Identified conflicts
            resolution_method_description: Description of how consensus was reached
            modified: Whether the recommendation was modified
            modification_summary: Summary of modifications if applicable
            
        Returns:
            ConsensusOutcome object
        """
        consensus_level = self._determine_consensus_level(support_metrics['weighted_support'])
        
        return ConsensusOutcome(
            recommendation=recommendation,
            consensus_level=consensus_level,
            support_percentage=support_metrics['weighted_support'],
            supporting_executives=[],  # Would be populated with actual executive IDs
            opposing_executives=[],
            abstaining_executives=[],
            key_conflicts=conflicts['critical_conflicts'],
            resolution_method=resolution_method_description,
            modified_from_original=modified,
            modification_summary=modification_summary
        )
    
    def _determine_consensus_level(self, support_percentage: float) -> ConsensusLevel:
        """
        Determine the consensus level based on support percentage.
        
        Args:
            support_percentage: Weighted percentage of support (0-1)
            
        Returns:
            ConsensusLevel enum value
        """
        if support_percentage >= 0.9:
            return ConsensusLevel.STRONG_CONSENSUS
        elif support_percentage >= 0.75:
            return ConsensusLevel.GENERAL_CONSENSUS
        elif support_percentage >= 0.6:
            return ConsensusLevel.MAJORITY_AGREEMENT
        elif support_percentage >= 0.4:
            return ConsensusLevel.DIVIDED_OPINION
        else:
            return ConsensusLevel.STRONG_DISAGREEMENT
    
    def _select_resolution_method(self, conflicts: Dict[str, Any]) -> ConflictResolutionMethod:
        """
        Select an appropriate conflict resolution method based on the nature of conflicts.
        
        Args:
            conflicts: Identified conflicts
            
        Returns:
            Selected resolution method
        """
        # Count conflict types
        conflict_types = {}
        for conflict in conflicts['all_conflicts']:
            conflict_type = conflict.get('type', 'unknown')
            if conflict_type in conflict_types:
                conflict_types[conflict_type] += 1
            else:
                conflict_types[conflict_type] = 1
        
        # Select method based on predominant conflict type
        if conflict_types.get('shared_concern', 0) > len(conflicts['all_conflicts']) / 2:
            # If most conflicts are shared concerns, use integrative approach
            return ConflictResolutionMethod.INTEGRATIVE
        
        if conflict_types.get('polarized_opinion', 0) > 0:
            # If there's polarization, use structured debate or dialectical inquiry
            return ConflictResolutionMethod.STRUCTURED_DEBATE
        
        if conflict_types.get('role_based', 0) > 0:
            # If there are role-based conflicts, use weighted voting based on expertise
            return ConflictResolutionMethod.WEIGHTED_VOTING
        
        # Default to evidence-based approach
        return ConflictResolutionMethod.EVIDENCE_BASED
    
    async def _apply_resolution_method(
        self,
        method: ConflictResolutionMethod,
        recommendation: ExecutiveRecommendation,
        evaluations: List[ConsensusEvaluation],
        conflicts: Dict[str, Any],
        context: Dict[str, Any]
    ) -> ExecutiveRecommendation:
        """
        Apply the selected conflict resolution method.
        
        Args:
            method: The resolution method to apply
            recommendation: The original recommendation
            evaluations: Executive evaluations
            conflicts: Identified conflicts
            context: Decision context
            
        Returns:
            Potentially modified recommendation
        """
        self.logger.info(f"Applying resolution method: {method.value}")
        
        # This is a simplified implementation that would be more sophisticated in a real system
        
        # Create a modified recommendation based on the resolution method
        modified_recommendation = recommendation.model_copy(deep=True)
        
        if method == ConflictResolutionMethod.INTEGRATIVE:
            # Integrate concerns and suggestions from evaluations
            all_suggestions = []
            for evaluation in evaluations:
                all_suggestions.extend(evaluation.suggestions)
            
            # Update recommendation with suggestions
            if all_suggestions:
                modification_note = f"Modified to address concerns: {', '.join(all_suggestions[:3])}"
                if len(all_suggestions) > 3:
                    modification_note += f" and {len(all_suggestions) - 3} more"
                
                # In a real implementation, we would intelligently integrate these suggestions
                # For this prototype, we'll just note them in the recommendation
                if not modified_recommendation.domain_specific_analyses:
                    modified_recommendation.domain_specific_analyses = {}
                
                modified_recommendation.domain_specific_analyses["consensus_modifications"] = {
                    "integrated_suggestions": all_suggestions,
                    "modification_note": modification_note
                }
        
        elif method == ConflictResolutionMethod.WEIGHTED_VOTING:
            # Adjust recommendation based on expertise-weighted input
            # In a real implementation, this would involve more sophisticated weighting
            # For this prototype, we'll make simple adjustments
            
            # Calculate weighted concerns
            weighted_concerns = {}
            for evaluation in evaluations:
                weight = evaluation.expertise_level * evaluation.confidence
                for concern in evaluation.concerns:
                    if concern in weighted_concerns:
                        weighted_concerns[concern] += weight
                    else:
                        weighted_concerns[concern] = weight
            
            # Address top concerns
            top_concerns = sorted(weighted_concerns.items(), key=lambda x: x[1], reverse=True)[:2]
            if top_concerns:
                if not modified_recommendation.domain_specific_analyses:
                    modified_recommendation.domain_specific_analyses = {}
                
                modified_recommendation.domain_specific_analyses["weighted_voting_adjustments"] = {
                    "top_concerns_addressed": [concern for concern, _ in top_concerns],
                    "adjustment_note": f"Recommendation adjusted to address highest-weighted concerns"
                }
        
        elif method == ConflictResolutionMethod.STRUCTURED_DEBATE:
            # Simulate outcome of structured debate between opposing viewpoints
            # In a real implementation, this would involve actual debate between AI executives
            # For this prototype, we'll make a simple compromise
            
            # Identify supporting and opposing arguments
            supporting_args = []
            opposing_args = []
            
            for evaluation in evaluations:
                if evaluation.agreement_level >= 0.7:
                    supporting_args.extend(evaluation.supporting_arguments)
                elif evaluation.agreement_level <= 0.3:
                    opposing_args.extend(evaluation.concerns)
            
            # Create balanced assessment
            if not modified_recommendation.domain_specific_analyses:
                modified_recommendation.domain_specific_analyses = {}
            
            modified_recommendation.domain_specific_analyses["structured_debate_outcome"] = {
                "supporting_arguments": supporting_args,
                "opposing_arguments": opposing_args,
                "debate_outcome": "Recommendation adjusted to acknowledge valid opposing points while maintaining core direction"
            }
        
        else:  # Default or evidence-based approach
            # The evidence-based approach would gather additional data in a real implementation
            # For this prototype, we'll add a note about the need for more evidence
            if not modified_recommendation.uncertainty_factors:
                modified_recommendation.uncertainty_factors = []
            
            modified_recommendation.uncertainty_factors.append(
                "Resolution requires additional evidence to address factual disagreements"
            )
        
        return modified_recommendation
    
    def _estimate_new_support(
        self,
        current_support: float,
        conflicts: Dict[str, Any],
        resolution_method: ConflictResolutionMethod
    ) -> float:
        """
        Estimate the new support level after applying conflict resolution.
        
        Args:
            current_support: Current weighted support percentage
            conflicts: Identified conflicts
            resolution_method: Resolution method applied
            
        Returns:
            Estimated new support percentage
        """
        # This is a simplified model for estimating new support
        # In a real implementation, we would re-evaluate the modified recommendation
        
        # Base improvement depends on resolution method
        method_effectiveness = {
            ConflictResolutionMethod.EVIDENCE_BASED: 0.15,
            ConflictResolutionMethod.WEIGHTED_VOTING: 0.20,
            ConflictResolutionMethod.DELPHI_METHOD: 0.25,
            ConflictResolutionMethod.COMPROMISE: 0.15,
            ConflictResolutionMethod.INTEGRATIVE: 0.30,
            ConflictResolutionMethod.ESCALATION: 0.05,
            ConflictResolutionMethod.STRUCTURED_DEBATE: 0.20,
            ConflictResolutionMethod.DIALECTICAL_INQUIRY: 0.25
        }
        
        base_improvement = method_effectiveness.get(resolution_method, 0.15)
        
        # Adjust based on conflict severity
        critical_conflict_count = len(conflicts.get('critical_conflicts', []))
        conflict_penalty = min(0.05 * critical_conflict_count, 0.15)
        
        # Calculate new support (capped at 0.95 to maintain some uncertainty)
        new_support = min(0.95, current_support + base_improvement - conflict_penalty)
        
        # Ensure we don't go below current support (resolution shouldn't make things worse)
        return max(current_support, new_support)
    
    def _calculate_polarization(self, agreement_levels: List[float]) -> float:
        """
        Calculate a polarization index for agreement levels.
        
        Args:
            agreement_levels: List of agreement levels (0-1)
            
        Returns:
            Polarization index (0-1), where 1 is completely polarized
        """
        if len(agreement_levels) < 2:
            return 0.0
        
        # Calculate bimodality coefficient as a measure of polarization
        n = len(agreement_levels)
        mean = np.mean(agreement_levels)
        variance = np.var(agreement_levels, ddof=1) if n > 1 else 0
        
        # Calculate skewness and kurtosis
        if variance > 0:
            skewness = np.sum((agreement_levels - mean) ** 3) / (n * variance ** 1.5)
            kurtosis = np.sum((agreement_levels - mean) ** 4) / (n * variance ** 2) - 3
        else:
            return 0.0  # No variance means no polarization
        
        # Bimodality coefficient
        bimodality = (skewness ** 2 + 1) / (kurtosis + 3 * (n - 1) ** 2 / ((n - 2) * (n - 3)))
        
        # Normalize to 0-1 and invert to make higher values mean more polarization
        return min(1.0, max(0.0, bimodality))
    
    def _identify_opinion_clusters(self, evaluations: List[ConsensusEvaluation]) -> List[Dict[str, Any]]:
        """
        Identify clusters of similar opinions among executives.
        
        Args:
            evaluations: Executive evaluations
            
        Returns:
            List of identified opinion clusters
        """
        if len(evaluations) < 3:
            return []
        
        # Simple clustering based on agreement levels
        high_agreement = [e for e in evaluations if e.agreement_level >= 0.7]
        medium_agreement = [e for e in evaluations if 0.3 < e.agreement_level < 0.7]
        low_agreement = [e for e in evaluations if e.agreement_level <= 0.3]
        
        clusters = []
        
        if len(high_agreement) >= 2:
            clusters.append({
                "agreement_level": "high",
                "members": [e.evaluator_id for e in high_agreement],
                "avg_agreement": sum(e.agreement_level for e in high_agreement) / len(high_agreement),
                "size": len(high_agreement)
            })
        
        if len(medium_agreement) >= 2:
            clusters.append({
                "agreement_level": "medium",
                "members": [e.evaluator_id for e in medium_agreement],
                "avg_agreement": sum(e.agreement_level for e in medium_agreement) / len(medium_agreement),
                "size": len(medium_agreement)
            })
        
        if len(low_agreement) >= 2:
            clusters.append({
                "agreement_level": "low",
                "members": [e.evaluator_id for e in low_agreement],
                "avg_agreement": sum(e.agreement_level for e in low_agreement) / len(low_agreement),
                "size": len(low_agreement)
            })
        
        return clusters
    
    def _categorize_concerns(self, evaluations: List[ConsensusEvaluation]) -> Dict[str, int]:
        """
        Categorize and count concerns from evaluations.
        
        Args:
            evaluations: Executive evaluations
            
        Returns:
            Dictionary mapping concern categories to counts
        """
        # This is a simplified implementation
        # In a real system, we would use NLP to categorize concerns
        
        concern_categories = {
            "risk": 0,
            "ethics": 0,
            "feasibility": 0,
            "cost": 0,
            "strategy": 0,
            "legal": 0,
            "other": 0
        }
        
        # Keywords for simple categorization
        category_keywords = {
            "risk": ["risk", "danger", "threat", "hazard", "unsafe"],
            "ethics": ["ethics", "moral", "fair", "unfair", "values", "principle"],
            "feasibility": ["feasible", "practical", "realistic", "impossible", "difficult"],
            "cost": ["cost", "expense", "budget", "expensive", "affordable"],
            "strategy": ["strategy", "goal", "mission", "vision", "objective", "align"],
            "legal": ["legal", "compliance", "regulation", "law", "policy", "governance"]
        }
        
        for evaluation in evaluations:
            for concern in evaluation.concerns:
                concern_lower = concern.lower()
                categorized = False
                
                for category, keywords in category_keywords.items():
                    if any(keyword in concern_lower for keyword in keywords):
                        concern_categories[category] += 1
                        categorized = True
                        break
                
                if not categorized:
                    concern_categories["other"] += 1
        
        return concern_categories
    
    def _analyze_role_based_disagreement(self, evaluations: List[ConsensusEvaluation]) -> Dict[str, Any]:
        """
        Analyze whether disagreement follows role-based patterns.
        
        Args:
            evaluations: Executive evaluations
            
        Returns:
            Dictionary with role-based disagreement analysis
        """
        if len(evaluations) < 3:
            return {"role_based_patterns_detected": False}
        
        # Group evaluations by role
        role_groups = {}
        for evaluation in evaluations:
            role = evaluation.evaluator_role
            if role not in role_groups:
                role_groups[role] = []
            role_groups[role].append(evaluation)
        
        # Calculate within-role agreement and between-role agreement
        within_role_variance = []
        role_means = {}
        
        for role, evals in role_groups.items():
            if len(evals) >= 2:
                agreements = [e.agreement_level for e in evals]
                within_role_variance.append(np.var(agreements))
                role_means[role] = np.mean(agreements)
        
        # Calculate between-role variance
        if len(role_means) >= 2:
            between_role_variance = np.var(list(role_means.values()))
            avg_within_variance = np.mean(within_role_variance) if within_role_variance else 0
            
            # If between-role variance is significantly larger than within-role variance,
            # this suggests role-based disagreement
            role_based_disagreement = between_role_variance > (2 * avg_within_variance)
            
            # Identify opposing roles
            opposing_roles = []
            if role_based_disagreement:
                sorted_roles = sorted(role_means.items(), key=lambda x: x[1])
                if len(sorted_roles) >= 2:
                    most_positive = sorted_roles[-1]
                    most_negative = sorted_roles[0]
                    
                    if most_positive[1] - most_negative[1] > 0.3:
                        opposing_roles = [
                            {"role": most_positive[0], "avg_agreement": most_positive[1]},
                            {"role": most_negative[0], "avg_agreement": most_negative[1]}
                        ]
            
            return {
                "role_based_patterns_detected": role_based_disagreement,
                "between_role_variance": between_role_variance,
                "within_role_variance": avg_within_variance,
                "role_means": role_means,
                "opposing_roles": opposing_roles
            }
        
        return {"role_based_patterns_detected": False}
    
    def _interpret_disagreement_level(
        self,
        mean_agreement: float,
        std_agreement: float,
        polarization: float
    ) -> str:
        """
        Interpret the level and nature of disagreement.
        
        Args:
            mean_agreement: Mean agreement level
            std_agreement: Standard deviation of agreement
            polarization: Polarization index
            
        Returns:
            String describing the disagreement level and nature
        """
        if mean_agreement < 0.3:
            base_level = "Strong disagreement"
        elif mean_agreement < 0.5:
            base_level = "Moderate disagreement"
        elif mean_agreement < 0.7:
            base_level = "Mild disagreement"
        else:
            base_level = "General agreement"
        
        # Add nuance based on standard deviation and polarization
        if polarization > 0.6:
            nature = "highly polarized"
        elif polarization > 0.3:
            nature = "somewhat polarized"
        elif std_agreement > 0.25:
            nature = "with varied perspectives"
        else:
            nature = "with consistent perspectives"
        
        return f"{base_level}, {nature}"
"""
Bayesian Decision Framework
--------------------------
Implementation of Bayesian decision theory for AI executive decision-making.
"""

import numpy as np
from typing import Dict, List, Any, Optional, Tuple, Union, cast
import logging
from pydantic import BaseModel, Field

from src.decision_frameworks.base_framework import (
    BaseDecisionFramework,
    DecisionContext,
    DecisionRecommendation,
    UncertaintyType,
    ComplexityLevel
)


class ProbabilisticOutcome(BaseModel):
    """Represents a possible outcome with associated probability."""
    description: str = Field(..., description="Description of the outcome")
    probability: float = Field(..., ge=0.0, le=1.0, description="Probability of this outcome (0-1)")
    utility: float = Field(..., description="Utility/value of this outcome")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence in the probability estimate (0-1)")


class BayesianAlternative(BaseModel):
    """An alternative option with probabilistic outcomes."""
    id: str
    name: str
    description: str
    outcomes: List[ProbabilisticOutcome]
    prior_probability: float = Field(1.0, description="Prior probability assigned to this alternative")
    
    def expected_utility(self) -> float:
        """Calculate the expected utility of this alternative."""
        return sum(outcome.probability * outcome.utility for outcome in self.outcomes)
    
    def risk_assessment(self) -> Dict[str, Any]:
        """Assess the risk profile of this alternative."""
        utilities = [outcome.utility for outcome in self.outcomes]
        probabilities = [outcome.probability for outcome in self.outcomes]
        
        # Ensure probabilities sum to 1
        total_prob = sum(probabilities)
        if total_prob > 0:
            probabilities = [p/total_prob for p in probabilities]
        
        # Calculate variance as risk measure
        expected_value = sum(u * p for u, p in zip(utilities, probabilities))
        variance = sum(p * ((u - expected_value) ** 2) for u, p in zip(utilities, probabilities))
        
        # Calculate worst-case outcome
        worst_case = min(utilities)
        worst_case_probability = sum(p for u, p in zip(utilities, probabilities) if u == worst_case)
        
        return {
            "expected_utility": expected_value,
            "variance": variance,
            "standard_deviation": np.sqrt(variance) if variance >= 0 else 0,
            "worst_case": worst_case,
            "worst_case_probability": worst_case_probability,
            "coefficient_of_variation": np.sqrt(variance) / expected_value if expected_value != 0 else float('inf')
        }


class BayesianDecisionFramework(BaseDecisionFramework):
    """
    Implementation of Bayesian Decision Theory as a framework for decision-making.
    
    Uses probability theory and expected utility to make decisions under uncertainty.
    """
    
    def __init__(self, risk_tolerance: float = 0.5):
        """
        Initialize the Bayesian Decision Framework.
        
        Args:
            risk_tolerance: Risk tolerance parameter (0-1), where 0 is risk-averse and 1 is risk-seeking
        """
        super().__init__(
            name="Bayesian Decision Theory",
            description="A mathematical framework that quantifies decisions under uncertainty using probability theory and utilities."
        )
        self.risk_tolerance = risk_tolerance
        self.logger = logging.getLogger(__name__)
    
    async def apply(self, context: DecisionContext) -> DecisionRecommendation:
        """
        Apply Bayesian decision theory to the given context.
        
        Args:
            context: All relevant context for making a decision
            
        Returns:
            A decision recommendation based on Bayesian analysis
        """
        # Convert context alternatives to BayesianAlternatives
        alternatives = self._process_alternatives(context)
        
        # Calculate expected utility for each alternative
        for alt in alternatives:
            self.logger.info(f"Alternative {alt.name} has expected utility {alt.expected_utility()}")
        
        # Apply Bayesian updating if we have evidence/previous decisions
        if context.get('previous_decisions'):
            alternatives = self._apply_bayesian_update(alternatives, context['previous_decisions'])
        
        # Perform risk-adjusted utility calculation
        risk_adjusted_utilities = self._calculate_risk_adjusted_utilities(alternatives)
        
        # Sort alternatives by risk-adjusted utility
        ordered_alternatives = sorted(
            zip(alternatives, risk_adjusted_utilities),
            key=lambda x: x[1],
            reverse=True
        )
        
        # Select best alternative
        best_alternative = ordered_alternatives[0][0]
        
        # Generate recommendation
        recommendation = self._generate_recommendation(best_alternative, ordered_alternatives, context)
        
        return recommendation
    
    def get_required_inputs(self) -> Dict[str, str]:
        """
        Get information about the inputs required by this framework.
        
        Returns:
            Dictionary mapping input names to descriptions of what's needed
        """
        return {
            "alternatives": "List of alternatives with potential outcomes",
            "outcome_probabilities": "Probability estimates for each outcome",
            "outcome_utilities": "Utility/value assessments for each outcome",
            "prior_probabilities": "Prior beliefs about alternatives (optional)",
            "risk_tolerance": "Organization's tolerance for risk (0-1)"
        }
    
    def evaluate_applicability(self, context: DecisionContext) -> Dict[str, Any]:
        """
        Evaluate how applicable the Bayesian framework is to the given context.
        
        Args:
            context: Decision context to evaluate
            
        Returns:
            Assessment of applicability including score and explanation
        """
        score = 0.0
        reasons = []
        
        # Check if we have quantifiable alternatives
        if len(context.get('alternatives', [])) > 0:
            score += 0.2
            reasons.append("Multiple alternatives available")
        else:
            reasons.append("Few or no alternatives provided (unfavorable)")
        
        # Check if uncertainty is primarily statistical/probabilistic
        uncertainty_types = context.get('domain_specific_context', {}).get('uncertainty_types', [])
        if UncertaintyType.STATISTICAL.value in uncertainty_types:
            score += 0.3
            reasons.append("Statistical uncertainty present (favorable)")
        elif UncertaintyType.TOTAL_IGNORANCE.value in uncertainty_types:
            score -= 0.2
            reasons.append("Total ignorance uncertainty present (unfavorable)")
        
        # Check complexity level
        complexity = context.get('domain_specific_context', {}).get('complexity_level', '')
        if complexity == ComplexityLevel.COMPLICATED.value:
            score += 0.2
            reasons.append("Complicated problem type (favorable)")
        elif complexity == ComplexityLevel.CHAOTIC.value:
            score -= 0.2
            reasons.append("Chaotic problem type (unfavorable)")
        
        # Check if we have historical data for priors
        if context.get('previous_decisions'):
            score += 0.2
            reasons.append("Historical data available for priors (favorable)")
        
        # Check if outcomes are quantifiable
        quantifiable_outcomes = True
        for alt in context.get('alternatives', []):
            if not alt.get('outcomes') or not all('utility' in o for o in alt.get('outcomes', [])):
                quantifiable_outcomes = False
                break
        
        if quantifiable_outcomes:
            score += 0.1
            reasons.append("Outcomes are quantifiable (favorable)")
        else:
            reasons.append("Outcomes difficult to quantify (unfavorable)")
        
        # Normalize score to 0-1
        final_score = max(0.0, min(1.0, score))
        
        return {
            "applicability_score": final_score,
            "reasons": reasons,
            "recommendation": "Highly recommended" if final_score > 0.7 else 
                             "Recommended" if final_score > 0.5 else
                             "Consider with caution" if final_score > 0.3 else
                             "Not recommended"
        }
    
    def _process_alternatives(self, context: DecisionContext) -> List[BayesianAlternative]:
        """
        Process the alternatives from the decision context into BayesianAlternatives.
        
        Args:
            context: The decision context
            
        Returns:
            List of BayesianAlternative objects
        """
        bayesian_alternatives = []
        
        for i, alt in enumerate(context.get('alternatives', [])):
            outcomes = []
            
            # Process outcomes for this alternative
            for outcome in alt.get('outcomes', []):
                outcomes.append(ProbabilisticOutcome(
                    description=outcome.get('description', 'Unnamed outcome'),
                    probability=float(outcome.get('probability', 0.5)),
                    utility=float(outcome.get('utility', 0.0)),
                    confidence=float(outcome.get('confidence', 0.5))
                ))
            
            # Create BayesianAlternative
            bayesian_alternatives.append(BayesianAlternative(
                id=alt.get('id', f"alternative_{i}"),
                name=alt.get('name', f"Alternative {i+1}"),
                description=alt.get('description', ''),
                outcomes=outcomes,
                prior_probability=float(alt.get('prior_probability', 1.0))
            ))
        
        return bayesian_alternatives
    
    def _apply_bayesian_update(
        self, 
        alternatives: List[BayesianAlternative], 
        previous_decisions: List[Dict[str, Any]]
    ) -> List[BayesianAlternative]:
        """
        Apply Bayesian updating based on previous decisions/evidence.
        
        Args:
            alternatives: The current alternatives
            previous_decisions: Previous related decisions
            
        Returns:
            Updated alternatives with posterior probabilities
        """
        # This is a simplified implementation of Bayesian updating
        # In a real implementation, this would be more sophisticated
        
        # Extract outcomes from previous decisions
        observed_outcomes = []
        for decision in previous_decisions:
            if decision.get('outcome'):
                observed_outcomes.append(decision['outcome'])
        
        if not observed_outcomes:
            return alternatives
        
        # Recalculate probabilities based on observed outcomes
        for alt in alternatives:
            likelihood = 1.0
            
            # Calculate likelihood of observed outcomes given this alternative
            for outcome in observed_outcomes:
                # Find matching outcomes in this alternative
                for alt_outcome in alt.outcomes:
                    if alt_outcome.description == outcome.get('description'):
                        likelihood *= alt_outcome.probability
            
            # Update prior with likelihood
            alt.prior_probability *= likelihood
        
        # Normalize posterior probabilities
        total_probability = sum(alt.prior_probability for alt in alternatives)
        if total_probability > 0:
            for alt in alternatives:
                alt.prior_probability /= total_probability
        
        return alternatives
    
    def _calculate_risk_adjusted_utilities(
        self, 
        alternatives: List[BayesianAlternative]
    ) -> List[float]:
        """
        Calculate risk-adjusted utilities for each alternative.
        
        Args:
            alternatives: The alternatives to evaluate
            
        Returns:
            List of risk-adjusted utility values
        """
        risk_adjusted_utilities = []
        
        for alt in alternatives:
            # Calculate expected utility
            expected_utility = alt.expected_utility()
            
            # Calculate risk metrics
            risk_assessment = alt.risk_assessment()
            std_dev = risk_assessment['standard_deviation']
            
            # Apply risk adjustment based on risk tolerance
            # risk_tolerance of 0 is risk-averse, 1 is risk-seeking
            risk_adjustment = (self.risk_tolerance - 0.5) * 2 * std_dev
            
            # Risk-averse decision makers subtract risk, risk-seeking add it
            risk_adjusted_utility = expected_utility + risk_adjustment
            
            # Apply prior probability
            final_utility = risk_adjusted_utility * alt.prior_probability
            
            risk_adjusted_utilities.append(final_utility)
        
        return risk_adjusted_utilities
    
    def _generate_recommendation(
        self,
        best_alternative: BayesianAlternative,
        ordered_alternatives: List[Tuple[BayesianAlternative, float]],
        context: DecisionContext
    ) -> DecisionRecommendation:
        """
        Generate a recommendation based on the Bayesian analysis.
        
        Args:
            best_alternative: The highest-utility alternative
            ordered_alternatives: All alternatives ordered by utility
            context: The original decision context
            
        Returns:
            A decision recommendation
        """
        # Find the original alternative data
        original_alt = next(
            (a for a in context.get('alternatives', []) if a.get('id') == best_alternative.id or a.get('name') == best_alternative.name),
            {}
        )
        
        # Calculate confidence based on margin between best and second best
        confidence = 0.7  # Default confidence
        if len(ordered_alternatives) > 1:
            best_utility = ordered_alternatives[0][1]
            second_best_utility = ordered_alternatives[1][1]
            if second_best_utility > 0:
                relative_margin = (best_utility - second_best_utility) / second_best_utility
                confidence = min(0.95, 0.5 + relative_margin)
            else:
                confidence = 0.95
        
        # Prepare risk information
        risk_info = best_alternative.risk_assessment()
        risks = []
        if risk_info['coefficient_of_variation'] > 1.0:
            risks.append({
                "type": "high_variance",
                "description": "High outcome variability relative to expected value",
                "severity": "high" if risk_info['coefficient_of_variation'] > 2.0 else "medium"
            })
        
        if risk_info['worst_case_probability'] > 0.2:
            risks.append({
                "type": "significant_downside",
                "description": f"Significant probability ({risk_info['worst_case_probability']:.1%}) of worst-case outcome",
                "severity": "high" if risk_info['worst_case_probability'] > 0.4 else "medium"
            })
        
        # Generate key factors
        key_factors = [
            f"Expected utility: {best_alternative.expected_utility():.2f}",
            f"Risk profile: {risk_info['standard_deviation']:.2f} standard deviation",
            f"Prior probability: {best_alternative.prior_probability:.2f}"
        ]
        
        # Generate rejected alternatives with reasons
        rejected_alternatives = []
        for alt, utility in ordered_alternatives[1:]:
            comparison = alt.expected_utility() - best_alternative.expected_utility()
            risk_diff = alt.risk_assessment()['standard_deviation'] - risk_info['standard_deviation']
            
            reason = "Lower expected utility"
            if comparison > 0:
                reason = "Higher risk profile despite better expected utility"
            
            rejected_alternatives.append({
                "id": alt.id,
                "name": alt.name,
                "expected_utility": alt.expected_utility(),
                "risk": alt.risk_assessment()['standard_deviation'],
                "reason_rejected": reason
            })
        
        # Create recommendation
        return DecisionRecommendation(
            recommended_alternative=original_alt,
            reasoning=f"Selected based on highest risk-adjusted expected utility of {ordered_alternatives[0][1]:.2f}",
            confidence_level=confidence,
            key_factors=key_factors,
            risks=risks,
            assumptions=[
                "Probabilities are accurately estimated",
                "Utility values correctly represent organizational preferences",
                f"Risk tolerance of {self.risk_tolerance} (0-1 scale) is appropriate"
            ],
            framework_specific_outputs={
                "expected_utility": best_alternative.expected_utility(),
                "risk_assessment": risk_info,
                "prior_probability": best_alternative.prior_probability,
                "risk_adjusted_utility": ordered_alternatives[0][1],
                "detailed_outcomes": [o.model_dump() for o in best_alternative.outcomes]
            },
            rejected_alternatives=rejected_alternatives
        )
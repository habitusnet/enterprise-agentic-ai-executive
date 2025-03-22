"""
Strategy Executive Agent
----------------------
Specialized executive agent focused on strategy, competitive positioning, and long-term planning.
"""

import logging
from typing import Dict, List, Any, Optional, Union
import asyncio

from src.executive_agents.base_executive import (
    BaseExecutive,
    ExecutiveRecommendation,
    ExecutiveContext,
    DecisionConfidence,
    ExpertiseLevel,
    StakeholderImpact,
    RiskAssessment,
    RecommendationAlternative
)


class StrategyExecutive(BaseExecutive):
    """
    AI executive specializing in strategic planning and competitive positioning.
    
    Focuses on evaluating long-term strategic decisions, competitive analysis,
    market positioning, and alignment with organizational vision and mission.
    """
    
    def __init__(self, name: str = "Strategy Executive", model_provider: str = "OpenAI", model_name: str = "gpt-4o"):
        """
        Initialize the Strategy Executive agent.
        
        Args:
            name: Name identifier for this executive
            model_provider: The LLM provider to use
            model_name: The specific model to use
        """
        # Define expertise domains with confidence levels
        expertise_domains = {
            "strategic_planning": ExpertiseLevel.EXPERT,
            "competitive_analysis": ExpertiseLevel.EXPERT,
            "market_positioning": ExpertiseLevel.EXPERT,
            "business_model_innovation": ExpertiseLevel.ADVANCED,
            "market_trends": ExpertiseLevel.ADVANCED,
            "mergers_acquisitions": ExpertiseLevel.PROFICIENT,
            "diversification": ExpertiseLevel.PROFICIENT,
            "strategic_partnerships": ExpertiseLevel.ADVANCED,
            "go_to_market": ExpertiseLevel.ADVANCED,
            "product_roadmap": ExpertiseLevel.PROFICIENT,
            "internationalization": ExpertiseLevel.BASIC
        }
        
        super().__init__(name, "Chief Strategy Officer", expertise_domains)
        self.logger = logging.getLogger(__name__)
        self.model_provider = model_provider
        self.model_name = model_name
    
    async def analyze(self, context: ExecutiveContext) -> ExecutiveRecommendation:
        """
        Analyze the given context and produce a strategic recommendation.
        
        Args:
            context: All relevant context for making a strategic decision
            
        Returns:
            An executive recommendation based on strategic analysis
        """
        self.logger.info(f"Strategy Executive analyzing: {context['query']}")
        
        # In a real implementation, this would use the actual LLM call
        # For this prototype, we'll simulate a strategic analysis
        
        # Example strategic analysis process:
        # 1. Analyze current position
        current_position = await self._analyze_current_position(context)
        
        # 2. Identify strategic options
        strategic_options = await self._identify_strategic_options(context, current_position)
        
        # 3. Evaluate options against strategic goals
        evaluated_options = await self._evaluate_options(strategic_options, context)
        
        # 4. Select best option and create recommendation
        recommendation = await self._create_recommendation(evaluated_options, context)
        
        # Log the decision
        self.log_decision(context, recommendation)
        
        return recommendation
    
    async def evaluate_recommendation(self, recommendation: ExecutiveRecommendation) -> Dict[str, Any]:
        """
        Evaluate a recommendation from a strategic perspective.
        
        Args:
            recommendation: The recommendation to evaluate
            
        Returns:
            Evaluation results including strategic alignment and concerns
        """
        self.logger.info(f"Strategy Executive evaluating recommendation: {recommendation.title}")
        
        # In a real implementation, this would use the actual LLM
        # For this prototype, we'll simulate strategic evaluation
        
        # Extract key strategic aspects to evaluate
        strategic_aspects = {
            "long_term_alignment": self._evaluate_long_term_alignment(recommendation),
            "competitive_advantage": self._evaluate_competitive_advantage(recommendation),
            "market_position_impact": self._evaluate_market_position(recommendation),
            "resource_allocation": self._evaluate_resource_allocation(recommendation),
            "business_model_impact": self._evaluate_business_model_impact(recommendation),
        }
        
        # Calculate overall strategic agreement
        aspect_scores = [score for _, score in strategic_aspects.items()]
        agreement_level = sum(aspect_scores) / len(aspect_scores) if aspect_scores else 0.5
        
        # Generate strategic concerns
        concerns = []
        if strategic_aspects["long_term_alignment"] < 0.6:
            concerns.append("Limited alignment with long-term strategic vision")
        
        if strategic_aspects["competitive_advantage"] < 0.5:
            concerns.append("Does not strengthen competitive position adequately")
        
        if strategic_aspects["market_position_impact"] < 0.5:
            concerns.append("Insufficient impact on market positioning")
        
        if strategic_aspects["resource_allocation"] < 0.4:
            concerns.append("Suboptimal allocation of strategic resources")
        
        # Generate supporting arguments
        supporting_arguments = []
        for aspect, score in strategic_aspects.items():
            if score > 0.7:
                aspect_name = aspect.replace("_", " ").title()
                supporting_arguments.append(f"Strong {aspect_name}")
        
        # Generate improvement suggestions
        suggestions = []
        if strategic_aspects["long_term_alignment"] < 0.6:
            suggestions.append("Strengthen alignment with 5-year strategic plan")
        
        if strategic_aspects["competitive_advantage"] < 0.5:
            suggestions.append("Enhance differentiation from key competitors")
        
        if not supporting_arguments:
            supporting_arguments.append("Acceptable strategic foundation but requires refinement")
        
        return {
            "agreement_level": agreement_level,
            "concerns": concerns,
            "suggestions": suggestions,
            "supporting_arguments": supporting_arguments,
            "confidence": 0.85,  # High confidence in strategic assessment
            "strategic_aspects": strategic_aspects
        }
    
    async def integrate_feedback(
        self, 
        recommendation: ExecutiveRecommendation, 
        feedback: List[Dict[str, Any]]
    ) -> ExecutiveRecommendation:
        """
        Integrate feedback from other executives to improve a strategic recommendation.
        
        Args:
            recommendation: The original recommendation
            feedback: Feedback from other executives
            
        Returns:
            An updated recommendation incorporating the feedback
        """
        self.logger.info(f"Strategy Executive integrating feedback for: {recommendation.title}")
        
        # Create a modified recommendation
        updated_recommendation = recommendation.model_copy(deep=True)
        
        # Analyze feedback themes
        feedback_themes = self._analyze_feedback_themes(feedback)
        
        # Apply strategic adjustments based on feedback
        if "competitive_concerns" in feedback_themes:
            # Enhance competitive differentiation aspects
            if not updated_recommendation.domain_specific_analyses:
                updated_recommendation.domain_specific_analyses = {}
            
            updated_recommendation.domain_specific_analyses["competitive_analysis"] = {
                "feedback_integrated": "Enhanced competitive differentiation",
                "original_assessment": updated_recommendation.domain_specific_analyses.get("competitive_analysis", {})
            }
            
            # Add to supporting evidence
            updated_recommendation.supporting_evidence.append(
                "Competitive differentiation enhanced based on cross-functional input"
            )
        
        if "financial_viability" in feedback_themes:
            # Adjust resource requirements based on financial feedback
            if not updated_recommendation.resource_requirements:
                updated_recommendation.resource_requirements = {}
            
            updated_recommendation.resource_requirements["financial_adjustments"] = {
                "description": "Resource requirements adjusted based on financial executive feedback",
                "optimization_applied": True
            }
        
        if "risk_concerns" in feedback_themes:
            # Add additional risk assessments
            new_risk = RiskAssessment(
                risk_category="strategic_execution_risk",
                likelihood=DecisionConfidence.MODERATE,
                impact=DecisionConfidence.HIGH,
                risk_description="Risk of execution challenges identified through cross-functional feedback",
                mitigation_strategies=[
                    "Phased implementation approach",
                    "Dedicated cross-functional implementation team",
                    "Regular milestone reviews with executive team"
                ]
            )
            
            updated_recommendation.risks.append(new_risk)
        
        # Update uncertainty factors
        if not updated_recommendation.uncertainty_factors:
            updated_recommendation.uncertainty_factors = []
        
        updated_recommendation.uncertainty_factors.append(
            "Cross-functional consensus limitations identified during executive review"
        )
        
        # Adjust implementation timeline if it exists
        if updated_recommendation.implementation_timeline:
            updated_recommendation.implementation_timeline["adjusted_for_feedback"] = True
        
        # Note the framework used to integrate feedback
        updated_recommendation.framework_used = "Strategic-Integrative Feedback Synthesis"
        
        return updated_recommendation
    
    async def _analyze_current_position(self, context: ExecutiveContext) -> Dict[str, Any]:
        """
        Analyze the current strategic position.
        
        Args:
            context: Executive context
            
        Returns:
            Analysis of current strategic position
        """
        # Extract relevant information from context
        market_data = context.get("available_data", {}).get("market_data", {})
        competitors = context.get("background_information", {}).get("competitors", [])
        
        # In a real implementation, this would be a complex analysis using the LLM
        # For this prototype, we'll return a simplified analysis
        
        return {
            "market_position": "established",  # established, emerging, leading, declining
            "competitive_strength": 0.7,  # 0-1 scale
            "market_share": market_data.get("market_share", 0.15),
            "growth_rate": market_data.get("growth_rate", 0.05),
            "key_strengths": ["brand_recognition", "product_quality", "distribution_network"],
            "key_weaknesses": ["cost_structure", "digital_capabilities"],
            "core_competencies": ["customer_relationships", "industry_expertise"],
            "competitor_analysis": {comp: {"threat_level": "medium"} for comp in competitors}
        }
    
    async def _identify_strategic_options(
        self, 
        context: ExecutiveContext, 
        current_position: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Identify potential strategic options based on context and current position.
        
        Args:
            context: Executive context
            current_position: Analysis of current strategic position
            
        Returns:
            List of potential strategic options
        """
        # In a real implementation, this would generate options using the LLM
        # For this prototype, we'll return predefined options
        
        query = context.get("query", "")
        
        # Generate different options depending on the type of query
        if "expansion" in query.lower() or "growth" in query.lower():
            return [
                {
                    "title": "Market Penetration Strategy",
                    "description": "Increase market share in existing markets with existing products",
                    "approach": "Aggressive marketing and competitive pricing",
                    "resource_intensity": "medium",
                    "time_horizon": "short_term",
                    "risk_level": "low"
                },
                {
                    "title": "Market Development Strategy",
                    "description": "Enter new markets with existing products",
                    "approach": "Geographic expansion and new customer segments",
                    "resource_intensity": "high",
                    "time_horizon": "medium_term",
                    "risk_level": "medium"
                },
                {
                    "title": "Product Development Strategy",
                    "description": "Develop new products for existing markets",
                    "approach": "R&D investment and innovation focus",
                    "resource_intensity": "high",
                    "time_horizon": "medium_term",
                    "risk_level": "medium"
                },
                {
                    "title": "Diversification Strategy",
                    "description": "Develop new products for new markets",
                    "approach": "Acquisition or internal development",
                    "resource_intensity": "very_high",
                    "time_horizon": "long_term",
                    "risk_level": "high"
                }
            ]
        elif "competitive" in query.lower() or "position" in query.lower():
            return [
                {
                    "title": "Cost Leadership Strategy",
                    "description": "Become the lowest-cost producer in the industry",
                    "approach": "Operational efficiency and economies of scale",
                    "resource_intensity": "high",
                    "time_horizon": "long_term",
                    "risk_level": "medium"
                },
                {
                    "title": "Differentiation Strategy",
                    "description": "Create unique products or services",
                    "approach": "Innovation and brand development",
                    "resource_intensity": "medium",
                    "time_horizon": "medium_term",
                    "risk_level": "medium"
                },
                {
                    "title": "Focus Strategy",
                    "description": "Concentrate on a narrow segment and achieve cost leadership or differentiation",
                    "approach": "Specialized expertise and tailored offerings",
                    "resource_intensity": "medium",
                    "time_horizon": "short_term",
                    "risk_level": "low"
                }
            ]
        else:
            # Default options
            return [
                {
                    "title": "Organic Growth Strategy",
                    "description": "Expand through internal development",
                    "approach": "Reinvestment of profits and capability building",
                    "resource_intensity": "medium",
                    "time_horizon": "long_term",
                    "risk_level": "low"
                },
                {
                    "title": "Acquisition Strategy",
                    "description": "Grow through strategic acquisitions",
                    "approach": "Identify and integrate complementary businesses",
                    "resource_intensity": "high",
                    "time_horizon": "short_term",
                    "risk_level": "high"
                },
                {
                    "title": "Strategic Partnership Strategy",
                    "description": "Establish key partnerships to access new capabilities or markets",
                    "approach": "Joint ventures and strategic alliances",
                    "resource_intensity": "low",
                    "time_horizon": "medium_term",
                    "risk_level": "medium"
                }
            ]
    
    async def _evaluate_options(
        self, 
        options: List[Dict[str, Any]], 
        context: ExecutiveContext
    ) -> List[Dict[str, Any]]:
        """
        Evaluate strategic options against organizational priorities and constraints.
        
        Args:
            options: List of strategic options
            context: Executive context
            
        Returns:
            Evaluated strategic options with scores
        """
        # Get organizational priorities
        priorities = context.get("organizational_priorities", [])
        
        # Create priority weights (default equal if none specified)
        priority_weights = {}
        if priorities:
            weight = 1.0 / len(priorities)
            for priority in priorities:
                priority_weights[priority] = weight
        else:
            # Default priorities if none specified
            priority_weights = {
                "growth": 0.3,
                "profitability": 0.3,
                "innovation": 0.2,
                "sustainability": 0.1,
                "customer_satisfaction": 0.1
            }
        
        # Evaluate each option
        evaluated_options = []
        
        for option in options:
            # Simulate evaluation scores for each priority
            priority_scores = {}
            for priority, weight in priority_weights.items():
                # In a real implementation, this would be a more sophisticated evaluation
                if priority == "growth" and option.get("time_horizon") == "long_term":
                    score = 0.8
                elif priority == "growth" and "growth" in option.get("title", "").lower():
                    score = 0.9
                elif priority == "profitability" and option.get("resource_intensity") == "low":
                    score = 0.9
                elif priority == "profitability" and option.get("resource_intensity") == "high":
                    score = 0.5
                elif priority == "innovation" and "development" in option.get("description", "").lower():
                    score = 0.8
                elif priority == "sustainability" and option.get("risk_level") == "low":
                    score = 0.7
                elif priority == "customer_satisfaction" and "experience" in option.get("description", "").lower():
                    score = 0.9
                else:
                    # Default score
                    score = 0.6
                
                priority_scores[priority] = score
            
            # Calculate weighted total score
            total_score = sum(score * priority_weights[priority] for priority, score in priority_scores.items())
            
            # Add evaluation to the option
            option_with_evaluation = option.copy()
            option_with_evaluation["priority_scores"] = priority_scores
            option_with_evaluation["total_score"] = total_score
            
            evaluated_options.append(option_with_evaluation)
        
        # Sort by total score (highest first)
        evaluated_options.sort(key=lambda x: x["total_score"], reverse=True)
        
        return evaluated_options
    
    async def _create_recommendation(
        self, 
        evaluated_options: List[Dict[str, Any]], 
        context: ExecutiveContext
    ) -> ExecutiveRecommendation:
        """
        Create a strategic recommendation based on the highest-scoring option.
        
        Args:
            evaluated_options: Evaluated strategic options
            context: Executive context
            
        Returns:
            Executive recommendation for the strategic decision
        """
        if not evaluated_options:
            # Create default recommendation if no options available
            return ExecutiveRecommendation(
                title="Strategic Review Required",
                summary="Insufficient data for strategic recommendation",
                detailed_description="A comprehensive strategic review is required to gather more information before making a recommendation.",
                supporting_evidence=["Insufficient context provided"],
                confidence=DecisionConfidence.LOW
            )
        
        # Select the highest-scoring option
        best_option = evaluated_options[0]
        
        # Create alternatives from other options
        alternatives = []
        for option in evaluated_options[1:3]:  # Take next 2 highest scoring options
            alternative = RecommendationAlternative(
                title=option["title"],
                description=option["description"],
                strengths=[f"Strong alignment with {p}" for p, s in option["priority_scores"].items() if s > 0.7],
                weaknesses=[f"Weak alignment with {p}" for p, s in option["priority_scores"].items() if s < 0.4],
                why_not_selected=f"Lower overall strategic alignment (score: {option['total_score']:.2f}) compared to recommended option (score: {best_option['total_score']:.2f})"
            )
            alternatives.append(alternative)
        
        # Create stakeholder impacts
        stakeholder_impacts = []
        stakeholders = context.get("background_information", {}).get("stakeholders", ["customers", "employees", "shareholders"])
        
        for stakeholder in stakeholders:
            impact_level = "positive"
            if stakeholder == "employees" and best_option.get("resource_intensity") == "high":
                impact_level = "mixed"
                description = "Potential for organizational stress during implementation, but long-term growth opportunities"
            elif stakeholder == "shareholders" and best_option.get("time_horizon") == "long_term":
                impact_level = "mixed"
                description = "Short-term investment required, but strong long-term value creation potential"
            else:
                description = f"Positive impact through improved {best_option.get('approach', 'strategic positioning')}"
            
            stakeholder_impacts.append(
                StakeholderImpact(
                    stakeholder_group=stakeholder,
                    impact_level=impact_level,
                    impact_description=description,
                    confidence=DecisionConfidence.MODERATE,
                    mitigation_strategies=["Phased implementation", "Regular stakeholder communication"] if impact_level == "mixed" else None
                )
            )
        
        # Create risk assessments
        risks = []
        if best_option.get("risk_level") == "high":
            risks.append(
                RiskAssessment(
                    risk_category="execution_risk",
                    likelihood=DecisionConfidence.HIGH,
                    impact=DecisionConfidence.HIGH,
                    risk_description="Significant complexity in execution may lead to implementation challenges",
                    mitigation_strategies=[
                        "Detailed implementation roadmap",
                        "Regular milestone reviews",
                        "Dedicated implementation team"
                    ]
                )
            )
        
        if best_option.get("resource_intensity") == "high":
            risks.append(
                RiskAssessment(
                    risk_category="resource_risk",
                    likelihood=DecisionConfidence.MODERATE,
                    impact=DecisionConfidence.HIGH,
                    risk_description="Substantial resource requirements may strain organizational capacity",
                    mitigation_strategies=[
                        "Phased resource allocation",
                        "Regular resource review",
                        "Contingency planning for resource constraints"
                    ]
                )
            )
        
        if "competitive" in best_option.get("description", "").lower():
            risks.append(
                RiskAssessment(
                    risk_category="competitive_risk",
                    likelihood=DecisionConfidence.MODERATE,
                    impact=DecisionConfidence.HIGH,
                    risk_description="Competitor responses may reduce effectiveness of strategy",
                    mitigation_strategies=[
                        "Continuous competitive monitoring",
                        "Adaptive strategy mechanism",
                        "Building defensive moats"
                    ]
                )
            )
        
        # Create domain-specific analyses
        domain_analyses = {
            "strategic_alignment": {
                "organizational_fit": 0.8,
                "long_term_vision_alignment": 0.85,
                "core_competency_utilization": 0.75,
                "analysis": f"The {best_option['title']} leverages our existing strengths while addressing key strategic gaps."
            },
            "competitive_analysis": {
                "differentiation_potential": 0.7,
                "defensibility": 0.65,
                "competitive_response_risk": 0.6,
                "analysis": f"Strategy provides meaningful differentiation but competitors may be able to respond within {best_option.get('time_horizon', 'medium_term')}."
            },
            "market_analysis": {
                "market_growth_alignment": 0.75,
                "addressable_market_expansion": 0.8,
                "customer_value_proposition": 0.7,
                "analysis": "Well-aligned with market growth vectors and expands our addressable market."
            }
        }
        
        # Create success metrics
        success_metrics = [
            f"Increase in {metric}" for metric in ["market_share", "revenue", "customer_satisfaction", "brand_equity"]
        ]
        
        # Create uncertainty factors
        uncertainty_factors = [
            "Market evolution pace and direction",
            "Competitive landscape changes",
            "Regulatory environment shifts",
            "Resource availability constraints"
        ]
        
        # Create implementation timeline
        implementation_timeline = {
            "phases": [
                {
                    "name": "Preparation Phase",
                    "duration": "1-2 months",
                    "key_activities": ["Detailed planning", "Resource allocation", "Stakeholder communication"]
                },
                {
                    "name": "Initial Implementation",
                    "duration": "3-6 months",
                    "key_activities": ["Pilot initiatives", "Capability building", "Early metrics tracking"]
                },
                {
                    "name": "Full Deployment",
                    "duration": "6-12 months",
                    "key_activities": ["Scaled implementation", "Operational integration", "Performance monitoring"]
                },
                {
                    "name": "Optimization",
                    "duration": "Ongoing",
                    "key_activities": ["Performance review", "Strategy adjustment", "Continuous improvement"]
                }
            ],
            "critical_milestones": [
                {"name": "Strategy approval", "timeline": "Month 0"},
                {"name": "Resource allocation complete", "timeline": "Month 1"},
                {"name": "Initial implementation review", "timeline": "Month 6"},
                {"name": "Full deployment review", "timeline": "Month 12"}
            ]
        }
        
        # Create resource requirements
        resource_requirements = {
            "financial": {
                "initial_investment": "$X million",
                "ongoing_operational_cost": "$Y million/year",
                "expected_roi_timeline": f"{best_option.get('time_horizon', 'medium_term')}"
            },
            "personnel": {
                "new_roles_required": best_option.get("resource_intensity") == "high",
                "skill_development_needed": True,
                "key_capabilities": ["Strategic execution", "Change management", "Performance monitoring"]
            },
            "technology": {
                "new_systems_required": best_option.get("resource_intensity") in ["high", "very_high"],
                "integration_requirements": "Moderate"
            }
        }
        
        # Create the final recommendation
        recommendation = ExecutiveRecommendation(
            title=best_option["title"],
            summary=f"Recommended approach: {best_option['description']} through {best_option['approach']}.",
            detailed_description=f"""
                The recommended strategy is to pursue a {best_option['title']} approach, which involves {best_option['description']}.
                This will be accomplished through {best_option['approach']}.
                
                This strategy aligns with our organizational priorities with a strategic alignment score of {best_option['total_score']:.2f}.
                The resource intensity is {best_option['resource_intensity']} with a {best_option['time_horizon']} time horizon.
                
                Key strengths of this approach include {', '.join(domain_analyses['strategic_alignment'].get('analysis', '').split()[:5])}.
                The competitive positioning will be enhanced through {domain_analyses['competitive_analysis'].get('analysis', '').split()[:5]}.
            """,
            supporting_evidence=[
                f"Strategic alignment score of {best_option['total_score']:.2f}",
                f"Strong fit with organizational priorities ({', '.join(k for k, v in best_option.get('priority_scores', {}).items() if v > 0.7)})",
                f"Addresses key market opportunities as identified in context analysis",
                f"Leverages core organizational competencies"
            ],
            confidence=DecisionConfidence.HIGH if best_option["total_score"] > 0.8 else DecisionConfidence.MODERATE,
            alternatives_considered=alternatives,
            risks=risks,
            stakeholder_impacts=stakeholder_impacts,
            resource_requirements=resource_requirements,
            implementation_timeline=implementation_timeline,
            success_metrics=success_metrics,
            domain_specific_analyses=domain_analyses,
            uncertainty_factors=uncertainty_factors,
            framework_used="Strategic Option Evaluation Framework"
        )
        
        return recommendation
    
    def _evaluate_long_term_alignment(self, recommendation: ExecutiveRecommendation) -> float:
        """Evaluate alignment with long-term strategy."""
        # In a real implementation, this would be a more sophisticated evaluation
        # For this prototype, we'll use a simple heuristic
        
        long_term_indicators = [
            "vision" in recommendation.detailed_description.lower(),
            "long-term" in recommendation.detailed_description.lower(),
            "sustainable" in recommendation.detailed_description.lower(),
            "future" in recommendation.detailed_description.lower(),
            any("long" in timeline for timeline in recommendation.implementation_timeline.get("phases", [{}]) if isinstance(timeline, dict) and "duration" in timeline)
        ]
        
        # Calculate alignment score
        return sum(1 for indicator in long_term_indicators if indicator) / len(long_term_indicators)
    
    def _evaluate_competitive_advantage(self, recommendation: ExecutiveRecommendation) -> float:
        """Evaluate competitive advantage implications."""
        # Look for competitive advantage keywords
        competitive_keywords = ["competitive", "advantage", "differentiation", "unique", "moat", "positioning"]
        
        # Check for presence in recommendation
        keyword_presence = sum(1 for keyword in competitive_keywords if keyword in recommendation.detailed_description.lower())
        
        # Check if there's a competitive analysis section
        has_competitive_analysis = "competitive" in recommendation.domain_specific_analyses
        
        # Calculate score
        if has_competitive_analysis:
            return 0.6 + (0.4 * keyword_presence / len(competitive_keywords))
        else:
            return keyword_presence / len(competitive_keywords)
    
    def _evaluate_market_position(self, recommendation: ExecutiveRecommendation) -> float:
        """Evaluate impact on market positioning."""
        # Check for market analysis
        has_market_analysis = "market" in recommendation.domain_specific_analyses
        
        # Look for market position keywords
        market_keywords = ["market share", "positioning", "segment", "customer", "target", "growth"]
        
        # Check presence in recommendation
        keyword_presence = sum(1 for keyword in market_keywords if keyword in recommendation.detailed_description.lower())
        
        # Calculate score
        if has_market_analysis:
            return 0.7 + (0.3 * keyword_presence / len(market_keywords))
        else:
            return 0.3 + (0.4 * keyword_presence / len(market_keywords))
    
    def _evaluate_resource_allocation(self, recommendation: ExecutiveRecommendation) -> float:
        """Evaluate strategic resource allocation."""
        # Check if resource requirements are specified
        has_resources = bool(recommendation.resource_requirements)
        
        if not has_resources:
            return 0.3  # Low score if resources not considered
        
        # Check comprehensiveness of resource planning
        resource_aspects = ["financial", "personnel", "technology", "time"]
        covered_aspects = sum(1 for aspect in resource_aspects if aspect in str(recommendation.resource_requirements).lower())
        
        # Calculate score
        return 0.5 + (0.5 * covered_aspects / len(resource_aspects))
    
    def _evaluate_business_model_impact(self, recommendation: ExecutiveRecommendation) -> float:
        """Evaluate impact on business model."""
        # Look for business model keywords
        model_keywords = ["business model", "revenue", "pricing", "cost", "channel", "value proposition"]
        
        # Check presence in recommendation
        keyword_presence = sum(1 for keyword in model_keywords if keyword in recommendation.detailed_description.lower())
        
        # Calculate score
        return 0.3 + (0.7 * keyword_presence / len(model_keywords))
    
    def _analyze_feedback_themes(self, feedback: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Analyze feedback to identify common themes.
        
        Args:
            feedback: List of feedback from executives
            
        Returns:
            Dictionary of themes with their frequency
        """
        themes = {}
        
        # Process all feedback
        for exec_feedback in feedback:
            concerns = exec_feedback.get("concerns", [])
            
            for concern in concerns:
                concern_lower = concern.lower()
                
                # Categorize concerns into themes
                if any(term in concern_lower for term in ["compete", "competition", "competitor", "market position"]):
                    self._increment_theme(themes, "competitive_concerns")
                
                elif any(term in concern_lower for term in ["financ", "cost", "budget", "resource", "investment"]):
                    self._increment_theme(themes, "financial_viability")
                
                elif any(term in concern_lower for term in ["risk", "uncertainty", "downside", "failure"]):
                    self._increment_theme(themes, "risk_concerns")
                
                elif any(term in concern_lower for term in ["implement", "execution", "operationalize"]):
                    self._increment_theme(themes, "implementation_concerns")
                
                elif any(term in concern_lower for term in ["align", "fit", "strategy", "vision"]):
                    self._increment_theme(themes, "strategic_alignment")
                
                else:
                    self._increment_theme(themes, "other_concerns")
        
        return themes
    
    def _increment_theme(self, themes: Dict[str, int], theme: str) -> None:
        """Increment a theme counter."""
        if theme in themes:
            themes[theme] += 1
        else:
            themes[theme] = 1
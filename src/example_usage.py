"""
Example Usage of the Enterprise Agentic AI Executive Platform
------------------------------------------------------------

This example demonstrates how to use the platform to analyze a strategic business decision
using multiple AI executive agents, decision frameworks, and consensus building.
"""

import asyncio
import logging
from pprint import pprint

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("example")

# Import executive agents
from src.executive_agents.base_executive import ExecutiveContext, ExpertiseLevel
from src.executive_agents.strategy_executive import StrategyExecutive
from src.executive_agents.risk_executive import RiskExecutive

# Import decision frameworks
from src.decision_frameworks.base_framework import DecisionContext
from src.decision_frameworks.bayesian_framework import BayesianDecisionFramework

# Import consensus building
from src.consensus.consensus_builder import ConsensusBuilder, ConsensusEvaluation, DecisionParticipation

# Import orchestrator
from src.executive_team_orchestrator import ExecutiveTeamOrchestrator


async def main():
    """Run an example decision-making process."""
    logger.info("Starting Enterprise Agentic AI Executive Platform example")
    
    # 1. Set up the executive team
    logger.info("Setting up executive team")
    
    # Create executive agents
    strategy_exec = StrategyExecutive(name="Strategy Executive")
    risk_exec = RiskExecutive(name="Risk Management Executive")
    
    # Create decision frameworks
    bayesian_framework = BayesianDecisionFramework()
    
    # Create consensus builder
    consensus_builder = ConsensusBuilder()
    
    # Create orchestrator
    orchestrator = ExecutiveTeamOrchestrator()
    
    # Register executives and frameworks
    orchestrator.register_executive("strategy", strategy_exec)
    orchestrator.register_executive("risk", risk_exec)
    orchestrator.register_framework("bayesian", bayesian_framework)
    orchestrator.set_consensus_builder(consensus_builder)
    
    # 2. Create a decision request
    logger.info("Creating decision request")
    decision_request = {
        "decision_id": "d-2023-10-15-001",
        "query": "Should we expand our product line into the European market?",
        "context": {
            "background_information": {
                "company_description": "Mid-sized technology company specializing in AI-powered business analytics software",
                "current_markets": ["North America", "Asia Pacific"],
                "annual_revenue": "$50M",
                "growth_targets": "20% year-over-year",
                "available_capital": "$10M for expansion initiatives",
                "competitors": ["CompetitorA (15% European market share)", "CompetitorB (25% European market share)"],
                "product_differentiation": "Advanced AI capabilities, intuitive interface, strong customer support",
                "stakeholders": ["shareholders", "employees", "customers", "partners"]
            },
            "alternatives": [
                {
                    "id": "full_expansion",
                    "name": "Full Market Entry",
                    "description": "Establish European headquarters, full product line, local sales and support teams"
                },
                {
                    "id": "phased_expansion",
                    "name": "Phased Approach",
                    "description": "Start with core products in key markets, gradual expansion of offerings and territories"
                },
                {
                    "id": "partnership",
                    "name": "Strategic Partnership",
                    "description": "Partner with established European distributor to offer products without direct presence"
                },
                {
                    "id": "no_expansion",
                    "name": "Delay Expansion",
                    "description": "Focus on current markets for the next 1-2 years before reconsidering European entry"
                }
            ],
            "constraints": [
                "Expansion budget limited to $10M",
                "Must maintain core product development in existing markets",
                "Need to comply with EU regulations (GDPR, AI Act)",
                "Limited European market expertise on current team"
            ],
            "organizational_priorities": {
                "growth": "High priority",
                "profitability": "Medium priority",
                "market_leadership": "Medium priority",
                "innovation": "High priority",
                "risk_management": "Medium priority"
            }
        },
        "required_domains": ["strategic", "financial", "risk", "market"],
        "urgency": 3,  # 1-5 scale, 5 being most urgent
        "importance": 4,  # 1-5 scale, 5 being most important
        "complexity_level": "complicated"  # simple, complicated, complex, chaotic
    }
    
    # 3. Make the decision
    logger.info("Making decision")
    decision_outcome = await orchestrator.make_decision(decision_request)
    
    # 4. Print the results
    logger.info("Decision process complete")
    print("\n" + "="*80)
    print("DECISION OUTCOME SUMMARY")
    print("="*80)
    print(f"Decision ID: {decision_outcome['decision_id']}")
    print(f"Query: {decision_outcome['query']}")
    print("\nRECOMMENDATION:")
    print(f"Title: {decision_outcome['recommendation'].title}")
    print(f"Summary: {decision_outcome['recommendation'].summary}")
    print(f"Confidence: {decision_outcome['recommendation'].confidence}")
    
    print("\nCONSENSUS INFORMATION:")
    print(f"Consensus Level: {decision_outcome['consensus'].consensus_level}")
    print(f"Support Percentage: {decision_outcome['consensus'].support_percentage:.1%}")
    print("\nExecutive Agreement:")
    for exec_name, agreement in decision_outcome['consensus'].executive_agreement.items():
        print(f"  - {exec_name}: {agreement:.1%}")
    
    if decision_outcome['consensus'].key_conflicts:
        print("\nKey Conflicts:")
        for conflict in decision_outcome['consensus'].key_conflicts:
            print(f"  - {conflict}")
    
    print("\nPARTICIPATING EXECUTIVES:")
    for exec_name in decision_outcome['participating_executives']:
        print(f"  - {exec_name}")
    
    print(f"\nSELECTED FRAMEWORK: {decision_outcome['selected_framework']}")
    print(f"RESOLUTION ATTEMPTS: {decision_outcome['resolution_attempts']}")
    
    print("\nDETAILED RECOMMENDATION:")
    print("-"*80)
    print(decision_outcome['recommendation'].detailed_description)
    
    print("\nRISKS:")
    if decision_outcome['recommendation'].risks:
        for risk in decision_outcome['recommendation'].risks:
            print(f"  - {risk.risk_category}: {risk.risk_description}")
            print(f"    Impact: {risk.impact}, Likelihood: {risk.likelihood}")
            print(f"    Mitigations: {', '.join(risk.mitigation_strategies[:2])}")
            print()
    else:
        print("  No specific risks identified")
    
    print("\nALTERNATIVES CONSIDERED:")
    if decision_outcome['recommendation'].alternatives_considered:
        for alt in decision_outcome['recommendation'].alternatives_considered:
            print(f"  - {alt.title}: {alt.description}")
            print(f"    Why not selected: {alt.why_not_selected}")
            print()
    else:
        print("  No alternatives specified")
    
    print("="*80)


if __name__ == "__main__":
    asyncio.run(main())
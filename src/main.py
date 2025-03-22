"""
Enterprise Agentic AI Executive Platform - Main Module
------------------------------------------------------

This is the main execution module for the Enterprise Agentic AI Executive Platform,
providing a command-line interface to create and run business decisions using
the executive team simulation.
"""

import sys
import asyncio
import argparse
import logging
import json
from datetime import datetime
from pprint import pprint
from dotenv import load_dotenv
from colorama import Fore, Style, init
import questionary

# Import executive agents
from src.executive_agents.base_executive import ExecutiveContext, ExpertiseLevel
from src.executive_agents.strategy_executive import StrategyExecutive
from src.executive_agents.risk_executive import RiskExecutive

# Import decision frameworks
from src.decision_frameworks.base_framework import DecisionContext, ComplexityLevel
from src.decision_frameworks.bayesian_framework import BayesianDecisionFramework

# Import consensus building
from src.consensus.consensus_builder import ConsensusBuilder

# Import orchestrator
from src.executive_team_orchestrator import ExecutiveTeamOrchestrator, ExecutiveTeamConfig

# Import LLM models
from src.llm.models import LLM_ORDER, get_model_info

# Load environment variables from .env file
load_dotenv()

# Initialize colorama
init(autoreset=True)

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("main")

# Define available executives
EXECUTIVE_OPTIONS = [
    ("Chief Strategy Officer", "strategy"),
    ("Chief Risk Officer", "risk"),
    # Add more executives as they are implemented
]

async def run_decision_process(decision_request, model_name, model_provider, selected_executives):
    """
    Run the full decision-making process with the executive team.
    
    Args:
        decision_request: The decision request details
        model_name: The LLM model to use
        model_provider: The LLM provider
        selected_executives: List of selected executive types
        
    Returns:
        The decision outcome
    """
    logger.info(f"Starting decision process for: {decision_request['query']}")
    
    # Create orchestrator with configuration
    config = ExecutiveTeamConfig(
        consensus_threshold=0.7,
        min_executive_participation=0.6,
        default_decision_framework="bayesian",
        max_resolution_attempts=3,
        auto_select_framework=True
    )
    orchestrator = ExecutiveTeamOrchestrator(config)
    
    # Create and register executives
    if "strategy" in selected_executives:
        strategy_exec = StrategyExecutive(
            name="Strategy Executive",
            model_provider=model_provider,
            model_name=model_name
        )
        orchestrator.register_executive(
            executive=strategy_exec,
            role_priority={"strategic": 5, "market": 4, "innovation": 4, "financial": 3},
            veto_rights=["strategic"]
        )
    
    if "risk" in selected_executives:
        risk_exec = RiskExecutive(
            name="Risk Management Executive",
            model_provider=model_provider,
            model_name=model_name
        )
        orchestrator.register_executive(
            executive=risk_exec,
            role_priority={"risk": 5, "compliance": 5, "financial": 3, "operational": 4},
            veto_rights=["risk", "compliance"]
        )
    
    # Register frameworks
    bayesian_framework = BayesianDecisionFramework()
    orchestrator.register_framework(bayesian_framework)
    
    # Create consensus builder
    consensus_builder = ConsensusBuilder()
    orchestrator.set_consensus_builder(consensus_builder)
    
    # Make the decision
    decision_outcome = await orchestrator.make_decision(decision_request)
    
    return decision_outcome

def print_decision_output(decision_outcome):
    """
    Print the decision outcome in a formatted way.
    
    Args:
        decision_outcome: The decision outcome from the executive team
    """
    print("\n" + "="*80)
    print(f"{Fore.CYAN}DECISION OUTCOME SUMMARY{Style.RESET_ALL}")
    print("="*80)
    print(f"Decision ID: {decision_outcome['decision_id']}")
    print(f"Query: {decision_outcome['query']}")
    
    print(f"\n{Fore.GREEN}RECOMMENDATION:{Style.RESET_ALL}")
    print(f"Title: {decision_outcome['recommendation'].title}")
    print(f"Summary: {decision_outcome['recommendation'].summary}")
    print(f"Confidence: {decision_outcome['recommendation'].confidence.name}")
    
    print(f"\n{Fore.YELLOW}CONSENSUS INFORMATION:{Style.RESET_ALL}")
    print(f"Consensus Level: {decision_outcome['consensus'].consensus_level}")
    print(f"Support Percentage: {decision_outcome['consensus'].support_percentage:.1%}")
    
    print("\nExecutive Agreement:")
    for exec_name, agreement in decision_outcome['consensus'].executive_agreement.items():
        print(f"  - {exec_name}: {agreement:.1%}")
    
    if decision_outcome['consensus'].key_conflicts:
        print("\nKey Conflicts:")
        for conflict in decision_outcome['consensus'].key_conflicts:
            print(f"  - {conflict}")
    
    print(f"\n{Fore.MAGENTA}PARTICIPATING EXECUTIVES:{Style.RESET_ALL}")
    for exec_name in decision_outcome['participating_executives']:
        print(f"  - {exec_name}")
    
    print(f"\nSELECTED FRAMEWORK: {decision_outcome['selected_framework']}")
    print(f"RESOLUTION ATTEMPTS: {decision_outcome['resolution_attempts']}")
    
    print(f"\n{Fore.CYAN}DETAILED RECOMMENDATION:{Style.RESET_ALL}")
    print("-"*80)
    print(decision_outcome['recommendation'].detailed_description)
    
    print(f"\n{Fore.RED}RISKS:{Style.RESET_ALL}")
    if decision_outcome['recommendation'].risks:
        for risk in decision_outcome['recommendation'].risks:
            print(f"  - {risk.risk_category}: {risk.risk_description}")
            print(f"    Impact: {risk.impact.name}, Likelihood: {risk.likelihood.name}")
            print(f"    Mitigations: {', '.join(risk.mitigation_strategies[:2])}")
            print()
    else:
        print("  No specific risks identified")
    
    print(f"\n{Fore.YELLOW}ALTERNATIVES CONSIDERED:{Style.RESET_ALL}")
    if decision_outcome['recommendation'].alternatives_considered:
        for alt in decision_outcome['recommendation'].alternatives_considered:
            print(f"  - {alt.title}: {alt.description}")
            print(f"    Why not selected: {alt.why_not_selected}")
            print()
    else:
        print("  No alternatives specified")
    
    print("="*80)

async def main():
    """
    Main execution function for the CLI application.
    """
    parser = argparse.ArgumentParser(
        description="Enterprise Agentic AI Executive Platform - Simulate a high-performance executive team for decision support"
    )
    parser.add_argument(
        "--query",
        type=str,
        help="The decision query or question"
    )
    parser.add_argument(
        "--complexity",
        type=str,
        choices=["simple", "complicated", "complex", "chaotic"],
        default="complicated",
        help="Complexity level of the decision"
    )
    parser.add_argument(
        "--urgency",
        type=int,
        choices=range(1, 6),
        default=3,
        help="Urgency level (1-5)"
    )
    parser.add_argument(
        "--importance",
        type=int,
        choices=range(1, 6),
        default=4,
        help="Importance level (1-5)"
    )
    parser.add_argument(
        "--input-file",
        type=str,
        help="JSON file containing the full decision request"
    )
    parser.add_argument(
        "--show-reasoning",
        action="store_true",
        help="Show detailed reasoning from each executive"
    )
    
    args = parser.parse_args()
    
    # Determine how to get the decision request
    if args.input_file:
        # Load from file
        try:
            with open(args.input_file, 'r') as f:
                decision_request = json.load(f)
            print(f"Loaded decision request from {args.input_file}")
        except Exception as e:
            print(f"Error loading decision request from file: {e}")
            sys.exit(1)
    elif args.query:
        # Create basic request from arguments
        decision_request = {
            "decision_id": f"d-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "query": args.query,
            "complexity_level": args.complexity,
            "urgency": args.urgency,
            "importance": args.importance,
            "context": {},
            "required_domains": []
        }
        
        # Interactive mode to add more context
        add_context = questionary.confirm(
            "Would you like to add additional context for the decision?",
            default=True
        ).ask()
        
        if add_context:
            background = questionary.text(
                "Enter background information about the decision:"
            ).ask()
            
            alternatives = []
            while True:
                add_alternative = questionary.confirm(
                    "Add an alternative option to consider?",
                    default=len(alternatives) < 2
                ).ask()
                
                if not add_alternative:
                    break
                
                alt_name = questionary.text("Alternative name:").ask()
                alt_desc = questionary.text("Alternative description:").ask()
                
                alternatives.append({
                    "id": alt_name.lower().replace(" ", "_"),
                    "name": alt_name,
                    "description": alt_desc
                })
            
            constraints = []
            while True:
                add_constraint = questionary.confirm(
                    "Add a constraint on the decision?",
                    default=len(constraints) < 1
                ).ask()
                
                if not add_constraint:
                    break
                
                constraint = questionary.text("Enter constraint:").ask()
                constraints.append(constraint)
            
            # Update the decision request
            decision_request["context"] = {
                "background_information": {
                    "description": background
                },
                "alternatives": alternatives,
                "constraints": constraints
            }
            
            # Ask for domains to include
            domains = questionary.checkbox(
                "Select relevant domains for this decision:",
                choices=[
                    "strategic", "financial", "risk", "market",
                    "operational", "technical", "legal", "ethical"
                ]
            ).ask()
            
            if domains:
                decision_request["required_domains"] = domains
    else:
        print("Error: Either --query or --input-file must be provided")
        parser.print_help()
        sys.exit(1)
    
    # Select executives
    selected_executives = questionary.checkbox(
        "Select executives to include in the decision process:",
        choices=[questionary.Choice(display, value=value) for display, value in EXECUTIVE_OPTIONS],
        instruction="\n\nInstructions: \n1. Press Space to select/unselect executives.\n2. Press 'a' to select/unselect all.\n3. Press Enter when done.\n",
        validate=lambda x: len(x) > 0 or "You must select at least one executive.",
        style=questionary.Style(
            [
                ("checkbox-selected", "fg:green"),
                ("selected", "fg:green noinherit"),
                ("highlighted", "noinherit"),
                ("pointer", "noinherit"),
            ]
        ),
    ).ask()
    
    if not selected_executives:
        print("\n\nInterrupt received. Exiting...")
        sys.exit(0)
    
    print(f"\nSelected executives: {', '.join(Fore.GREEN + choice.title().replace('_', ' ') + Style.RESET_ALL for choice in selected_executives)}\n")
    
    # Select LLM model
    model_choice = questionary.select(
        "Select your LLM model:",
        choices=[questionary.Choice(display, value=value) for display, value, _ in LLM_ORDER],
        style=questionary.Style([
            ("selected", "fg:green bold"),
            ("pointer", "fg:green bold"),
            ("highlighted", "fg:green"),
            ("answer", "fg:green bold"),
        ])
    ).ask()
    
    if not model_choice:
        print("\n\nInterrupt received. Exiting...")
        sys.exit(0)
    
    # Get model info using the helper function
    model_info = get_model_info(model_choice)
    if model_info:
        model_provider = model_info.provider.value
        print(f"\nSelected {Fore.CYAN}{model_provider}{Style.RESET_ALL} model: {Fore.GREEN + Style.BRIGHT}{model_choice}{Style.RESET_ALL}\n")
    else:
        model_provider = "Unknown"
        print(f"\nSelected model: {Fore.GREEN + Style.BRIGHT}{model_choice}{Style.RESET_ALL}\n")
    
    # Run the decision process
    print(f"Making decision on: {decision_request['query']}")
    try:
        decision_outcome = await run_decision_process(
            decision_request=decision_request,
            model_name=model_choice,
            model_provider=model_provider,
            selected_executives=selected_executives
        )
        
        # Print the results
        print_decision_output(decision_outcome)
        
        # Optionally save the results
        save_results = questionary.confirm(
            "Would you like to save these decision results to a file?",
            default=False
        ).ask()
        
        if save_results:
            filename = f"decision_{decision_request['decision_id']}.json"
            with open(filename, 'w') as f:
                # Convert to JSON-serializable format
                result_dict = {
                    "decision_id": decision_outcome["decision_id"],
                    "query": decision_outcome["query"],
                    "participating_executives": decision_outcome["participating_executives"],
                    "selected_framework": decision_outcome["selected_framework"],
                    "resolution_attempts": decision_outcome["resolution_attempts"],
                    "recommendation": {
                        "title": decision_outcome["recommendation"].title,
                        "summary": decision_outcome["recommendation"].summary,
                        "confidence": decision_outcome["recommendation"].confidence.name,
                        "detailed_description": decision_outcome["recommendation"].detailed_description,
                    },
                    "consensus": {
                        "level": decision_outcome["consensus"].consensus_level.value,
                        "support_percentage": decision_outcome["consensus"].support_percentage,
                    },
                    "timestamp": datetime.now().isoformat()
                }
                json.dump(result_dict, f, indent=2)
            print(f"Results saved to {filename}")
        
    except Exception as e:
        logger.error(f"Error during decision process: {str(e)}")
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())

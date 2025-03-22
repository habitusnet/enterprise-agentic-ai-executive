#!/usr/bin/env python3
"""
Executive Template CLI Tool
--------------------------
Command-line interface for managing and using executive templates.
"""

import os
import sys
import json
import argparse
import asyncio
from pprint import pprint
from tabulate import tabulate
import questionary
from colorama import Fore, Style, init as colorama_init

# Add parent directory to path to allow imports
script_dir = os.path.dirname(os.path.realpath(__file__))
parent_dir = os.path.dirname(os.path.dirname(script_dir))
sys.path.append(parent_dir)

from src.executive_templates import (
    TemplateManager, 
    ExecutiveTemplate,
    ExecutiveTeamTemplate,
    DecisionStyle,
    RiskTolerance,
    TimeOrientation
)
from src.executive_team_orchestrator import ExecutiveTeamOrchestrator, ExecutiveTeamConfig

# Initialize colorama
colorama_init(autoreset=True)


def display_available_templates(template_manager):
    """Display a table of available executive templates."""
    templates = template_manager.get_available_templates()
    
    if not templates:
        print(f"{Fore.YELLOW}No executive templates found.{Style.RESET_ALL}")
        return
    
    # Prepare data for table
    table_data = []
    for template_id, info in templates.items():
        table_data.append([
            template_id,
            info["name"],
            info["base_role"],
            info["description"]
        ])
    
    # Display table
    print(f"\n{Fore.CYAN}Available Executive Templates:{Style.RESET_ALL}")
    print(tabulate(table_data, headers=["ID", "Name", "Base Role", "Description"]))


def display_available_team_templates(template_manager):
    """Display a table of available team templates."""
    templates = template_manager.get_available_team_templates()
    
    if not templates:
        print(f"{Fore.YELLOW}No team templates found.{Style.RESET_ALL}")
        return
    
    # Prepare data for table
    table_data = []
    for template_id, info in templates.items():
        table_data.append([
            template_id,
            info["name"],
            info["executive_count"],
            info["description"]
        ])
    
    # Display table
    print(f"\n{Fore.CYAN}Available Team Templates:{Style.RESET_ALL}")
    print(tabulate(table_data, headers=["ID", "Name", "Executives", "Description"]))


def display_template_details(template_manager, template_id):
    """Display detailed information about a specific template."""
    template = template_manager.get_template_details(template_id)
    
    if not template:
        print(f"{Fore.RED}Template '{template_id}' not found.{Style.RESET_ALL}")
        return
    
    print(f"\n{Fore.CYAN}Template Details: {template.name}{Style.RESET_ALL}")
    print(f"ID: {template.template_id}")
    print(f"Base Role: {template.base_role}")
    print(f"Description: {template.description}")
    
    # Display expertise domains
    print(f"\n{Fore.GREEN}Expertise Domains:{Style.RESET_ALL}")
    for domain, level in template.expertise_domains.items():
        print(f"  - {domain}: {level}")
    
    # Display attributes if available
    if template.attributes:
        print(f"\n{Fore.GREEN}Attributes:{Style.RESET_ALL}")
        for attr, value in template.attributes.items():
            print(f"  - {attr}: {value}")


def create_executive_interactive(template_manager):
    """Interactive workflow to create an executive from a template."""
    # Get available templates
    templates = template_manager.get_available_templates()
    if not templates:
        print(f"{Fore.RED}No templates available. Please create a template first.{Style.RESET_ALL}")
        return None
    
    # Ask user to select a template
    template_choices = [
        f"{info['name']} ({info['base_role']})" 
        for template_id, info in templates.items()
    ]
    template_ids = list(templates.keys())
    
    questions = [
        {
            "type": "select",
            "name": "template_index",
            "message": "Select a template to use:",
            "choices": template_choices
        },
        {
            "type": "text",
            "name": "custom_name",
            "message": "Executive name (leave blank to use template default):"
        }
    ]
    
    answers = questionary.prompt(questions)
    if not answers:
        return None
    
    template_id = template_ids[answers["template_index"]]
    custom_name = answers["custom_name"] if answers["custom_name"] else None
    
    # Ask for model information
    model_questions = [
        {
            "type": "select",
            "name": "model_provider",
            "message": "Select model provider:",
            "choices": ["OpenAI", "Anthropic", "Google", "Groq"]
        },
        {
            "type": "text",
            "name": "model_name",
            "message": "Model name:",
            "default": "gpt-4o"
        }
    ]
    
    model_answers = questionary.prompt(model_questions)
    if not model_answers:
        return None
    
    # Create the executive
    executive = template_manager.create_executive_from_template(
        template_id=template_id,
        custom_name=custom_name,
        model_provider=model_answers["model_provider"],
        model_name=model_answers["model_name"]
    )
    
    if executive:
        print(f"{Fore.GREEN}Successfully created executive: {executive.name} ({executive.role}){Style.RESET_ALL}")
    else:
        print(f"{Fore.RED}Failed to create executive from template.{Style.RESET_ALL}")
    
    return executive


def create_custom_template_interactive(template_manager):
    """Interactive workflow to create a custom executive template."""
    # Get base roles
    base_roles = ["Chief Strategy Officer", "Chief Risk Officer"]
    
    # Ask for template information
    questions = [
        {
            "type": "text",
            "name": "template_id",
            "message": "Template ID (unique identifier):"
        },
        {
            "type": "text",
            "name": "name",
            "message": "Template name:"
        },
        {
            "type": "select",
            "name": "base_role",
            "message": "Base role:",
            "choices": base_roles
        },
        {
            "type": "text",
            "name": "description",
            "message": "Description:"
        }
    ]
    
    answers = questionary.prompt(questions)
    if not answers:
        return
    
    # Ask for expertise domains
    expertise_domains = {}
    
    print(f"\n{Fore.CYAN}Add expertise domains (at least one required){Style.RESET_ALL}")
    
    while True:
        domain_question = [
            {
                "type": "text",
                "name": "domain",
                "message": "Domain name (leave blank to finish):"
            }
        ]
        
        domain_answer = questionary.prompt(domain_question)
        if not domain_answer or not domain_answer["domain"]:
            break
        
        domain = domain_answer["domain"]
        
        level_question = [
            {
                "type": "select",
                "name": "level",
                "message": f"Expertise level for {domain}:",
                "choices": ["NOVICE", "BASIC", "PROFICIENT", "ADVANCED", "EXPERT"]
            }
        ]
        
        level_answer = questionary.prompt(level_question)
        if not level_answer:
            break
        
        expertise_domains[domain] = level_answer["level"]
    
    if not expertise_domains:
        print(f"{Fore.RED}At least one expertise domain is required.{Style.RESET_ALL}")
        return
    
    # Ask for attributes
    attributes = {}
    
    print(f"\n{Fore.CYAN}Add attributes (optional){Style.RESET_ALL}")
    
    # Decision style
    decision_style_question = [
        {
            "type": "select",
            "name": "decision_style",
            "message": "Decision style:",
            "choices": [s.value for s in DecisionStyle]
        }
    ]
    
    decision_style_answer = questionary.prompt(decision_style_question)
    if decision_style_answer:
        attributes["decision_style"] = decision_style_answer["decision_style"].upper()
    
    # Risk tolerance
    risk_tolerance_question = [
        {
            "type": "select",
            "name": "risk_tolerance",
            "message": "Risk tolerance:",
            "choices": [r.value for r in RiskTolerance]
        }
    ]
    
    risk_tolerance_answer = questionary.prompt(risk_tolerance_question)
    if risk_tolerance_answer:
        attributes["risk_tolerance"] = risk_tolerance_answer["risk_tolerance"].upper()
    
    # Time orientation
    time_orientation_question = [
        {
            "type": "select",
            "name": "time_orientation",
            "message": "Time orientation:",
            "choices": [t.value for t in TimeOrientation]
        }
    ]
    
    time_orientation_answer = questionary.prompt(time_orientation_question)
    if time_orientation_answer:
        attributes["time_orientation"] = time_orientation_answer["time_orientation"].upper()
    
    # Create the template
    template = ExecutiveTemplate(
        template_id=answers["template_id"],
        base_role=answers["base_role"],
        name=answers["name"],
        description=answers["description"],
        expertise_domains=expertise_domains,
        attributes=attributes
    )
    
    # Save the template
    if template_manager.save_custom_template(template):
        print(f"{Fore.GREEN}Successfully created and saved template: {template.template_id}{Style.RESET_ALL}")
    else:
        print(f"{Fore.RED}Failed to save template.{Style.RESET_ALL}")


def create_team_template_interactive(template_manager):
    """Interactive workflow to create a team template."""
    # Get available executive templates
    templates = template_manager.get_available_templates()
    if not templates:
        print(f"{Fore.RED}No executive templates available. Please create an executive template first.{Style.RESET_ALL}")
        return
    
    # Ask for team template information
    questions = [
        {
            "type": "text",
            "name": "template_id",
            "message": "Team template ID (unique identifier):"
        },
        {
            "type": "text",
            "name": "name",
            "message": "Team template name:"
        },
        {
            "type": "text",
            "name": "description",
            "message": "Description:"
        }
    ]
    
    answers = questionary.prompt(questions)
    if not answers:
        return
    
    # Ask for executives to include
    exec_choices = [
        questionary.Choice(title=f"{info['name']} ({info['base_role']})", value=template_id)
        for template_id, info in templates.items()
    ]
    
    executive_question = [
        {
            "type": "checkbox",
            "name": "executives",
            "message": "Select executives to include in this team:",
            "choices": exec_choices
        }
    ]
    
    executive_answer = questionary.prompt(executive_question)
    if not executive_answer or not executive_answer["executives"]:
        print(f"{Fore.RED}You must select at least one executive.{Style.RESET_ALL}")
        return
    
    executives = executive_answer["executives"]
    
    # Create the team template
    team_template = ExecutiveTeamTemplate(
        template_id=answers["template_id"],
        name=answers["name"],
        description=answers["description"],
        executives=executives
    )
    
    # Save the team template
    if template_manager.save_team_template(team_template):
        print(f"{Fore.GREEN}Successfully created and saved team template: {team_template.template_id}{Style.RESET_ALL}")
    else:
        print(f"{Fore.RED}Failed to save team template.{Style.RESET_ALL}")


async def run_decision_with_team_template(template_manager):
    """Interactive workflow to run a decision with a team template."""
    # Get available team templates
    team_templates = template_manager.get_available_team_templates()
    if not team_templates:
        print(f"{Fore.RED}No team templates available. Please create a team template first.{Style.RESET_ALL}")
        return
    
    # Ask user to select a team template
    team_template_choices = [
        f"{info['name']} ({info['executive_count']} executives)" 
        for template_id, info in team_templates.items()
    ]
    team_template_ids = list(team_templates.keys())
    
    team_question = {
        "type": "select",
        "name": "team_template_index",
        "message": "Select a team template to use:",
        "choices": team_template_choices
    }
    
    team_answer = questionary.prompt([team_question])
    if not team_answer:
        return
    
    team_template_id = team_template_ids[team_answer["team_template_index"]]
    
    # Ask for model information
    model_questions = [
        {
            "type": "select",
            "name": "model_provider",
            "message": "Select model provider:",
            "choices": ["OpenAI", "Anthropic", "Google", "Groq"]
        },
        {
            "type": "text",
            "name": "model_name",
            "message": "Model name:",
            "default": "gpt-4o"
        }
    ]
    
    model_answers = questionary.prompt(model_questions)
    if not model_answers:
        return
    
    # Ask for decision information
    decision_questions = [
        {
            "type": "text",
            "name": "query",
            "message": "Decision query or question:"
        },
        {
            "type": "select",
            "name": "complexity",
            "message": "Complexity level:",
            "choices": ["simple", "complicated", "complex", "chaotic"],
            "default": "complicated"
        },
        {
            "type": "select",
            "name": "urgency",
            "message": "Urgency level (1-5):",
            "choices": ["1", "2", "3", "4", "5"],
            "default": "3"
        },
        {
            "type": "select",
            "name": "importance",
            "message": "Importance level (1-5):",
            "choices": ["1", "2", "3", "4", "5"],
            "default": "4"
        }
    ]
    
    decision_answers = questionary.prompt(decision_questions)
    if not decision_answers:
        return
    
    # Create decision request
    decision_request = {
        "decision_id": f"template-cli-{team_template_id}",
        "query": decision_answers["query"],
        "complexity_level": decision_answers["complexity"],
        "urgency": int(decision_answers["urgency"]),
        "importance": int(decision_answers["importance"]),
        "context": {},
        "required_domains": []
    }
    
    # Ask for additional context
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
    
    print(f"\n{Fore.CYAN}Creating executive team based on template: {team_template_id}{Style.RESET_ALL}")
    
    # Create the team from the template
    executives = template_manager.create_team_from_template(
        team_template_id=team_template_id,
        model_provider=model_answers["model_provider"],
        model_name=model_answers["model_name"]
    )
    
    if not executives:
        print(f"{Fore.RED}Failed to create executives from team template.{Style.RESET_ALL}")
        return
    
    print(f"{Fore.GREEN}Created {len(executives)} executives:{Style.RESET_ALL}")
    for executive in executives:
        print(f"  - {executive.name} ({executive.role})")
    
    # Create orchestrator
    print(f"\n{Fore.CYAN}Setting up executive team orchestrator...{Style.RESET_ALL}")
    
    config = ExecutiveTeamConfig(
        consensus_threshold=0.7,
        min_executive_participation=0.6,
        default_decision_framework="bayesian",
        max_resolution_attempts=3,
        auto_select_framework=True
    )
    
    orchestrator = ExecutiveTeamOrchestrator(config)
    
    # Register executives with the orchestrator
    for executive in executives:
        if "Strategy" in executive.role:
            orchestrator.register_executive(
                executive=executive,
                role_priority={"strategic": 5, "market": 4, "innovation": 4, "financial": 3},
                veto_rights=["strategic"]
            )
        elif "Risk" in executive.role:
            orchestrator.register_executive(
                executive=executive,
                role_priority={"risk": 5, "compliance": 5, "financial": 3, "operational": 4},
                veto_rights=["risk", "compliance"]
            )
        # Add more role checks as needed
    
    # For demonstration purposes, we'll just show the setup
    # In a real implementation, you would register frameworks and make the decision
    
    print(f"\n{Fore.YELLOW}This is a demonstration of setting up a decision with a team template.{Style.RESET_ALL}")
    print(f"In a real implementation, you would proceed to make the decision with:")
    print(f"  - Query: {decision_request['query']}")
    print(f"  - Complexity: {decision_request['complexity_level']}")
    print(f"  - Urgency: {decision_request['urgency']}/5")
    print(f"  - Importance: {decision_request['importance']}/5")
    
    print(f"\n{Fore.GREEN}Executive team is ready!{Style.RESET_ALL}")


def main():
    """Main function for the CLI tool."""
    parser = argparse.ArgumentParser(description="Executive Template CLI Tool")
    
    # Add commands
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # List templates command
    list_parser = subparsers.add_parser("list", help="List available templates")
    list_parser.add_argument("--teams", action="store_true", help="List team templates instead of executive templates")
    
    # View template details command
    view_parser = subparsers.add_parser("view", help="View template details")
    view_parser.add_argument("template_id", help="ID of the template to view")
    
    # Create executive command
    create_exec_parser = subparsers.add_parser("create-executive", help="Create an executive from a template")
    
    # Create template command
    create_template_parser = subparsers.add_parser("create-template", help="Create a custom executive template")
    
    # Create team template command
    create_team_parser = subparsers.add_parser("create-team", help="Create a team template")
    
    # Run decision with team template command
    run_parser = subparsers.add_parser("run", help="Run a decision with a team template")
    
    # Initialize template manager
    template_manager = TemplateManager()
    
    # Create default templates if needed
    template_manager.create_default_templates()
    
    # Parse arguments
    args = parser.parse_args()
    
    # Execute command
    if args.command == "list":
        if args.teams:
            display_available_team_templates(template_manager)
        else:
            display_available_templates(template_manager)
    
    elif args.command == "view":
        display_template_details(template_manager, args.template_id)
    
    elif args.command == "create-executive":
        create_executive_interactive(template_manager)
    
    elif args.command == "create-template":
        create_custom_template_interactive(template_manager)
    
    elif args.command == "create-team":
        create_team_template_interactive(template_manager)
    
    elif args.command == "run":
        asyncio.run(run_decision_with_team_template(template_manager))
    
    else:
        # Display help if no command provided
        parser.print_help()


if __name__ == "__main__":
    main()
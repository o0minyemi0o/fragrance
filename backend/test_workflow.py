"""
간단한 워크플로우 테스트 스크립트

Development Mode 워크플로우가 제대로 동작하는지 확인합니다.
"""

import sys
sys.path.insert(0, '/Users/minhye/myproject/fragrance/backend')

from app.agents.development.development_graph import get_development_workflow
from app.schema.states import DevelopmentState

def test_workflow():
    print("=" * 80)
    print("🧪 Development Workflow Test")
    print("=" * 80)

    # 워크플로우 가져오기
    try:
        workflow = get_development_workflow()
        print("✅ Workflow compiled successfully!")
    except Exception as e:
        print(f"❌ Failed to compile workflow: {e}")
        import traceback
        traceback.print_exc()
        return

    # 초기 상태 설정
    initial_state: DevelopmentState = {
        "messages": [],
        "current_user_input": "30대 여성을 위한 프레시 플로럴 향수를 만들고 싶어요",
        "conversation_stage": "initial",
        "available_ingredients": [],
        "ingredient_count": 0,
        "user_preferences": {},
        "suggested_ingredients": [],
        "formulations": [],
        "current_formulation": None,
        "next_node": None,
        "iteration_count": 0,
        "coordinator_reasoning": None,
        "response": ""
    }

    print("\n📝 Initial State:")
    print(f"  User Input: {initial_state['current_user_input']}")
    print(f"  Stage: {initial_state['conversation_stage']}")

    # 워크플로우 실행
    print("\n🚀 Starting workflow execution...\n")

    try:
        result = workflow.invoke(initial_state)

        print("\n" + "=" * 80)
        print("✅ Workflow Execution Complete!")
        print("=" * 80)

        print(f"\n📊 Final State:")
        print(f"  Iterations: {result.get('iteration_count', 'N/A')}")
        print(f"  Final Stage: {result.get('conversation_stage', 'N/A')}")
        print(f"  User Preferences: {result.get('user_preferences', {})}")
        print(f"  Formulation Created: {result.get('current_formulation') is not None}")

        if result.get('current_formulation'):
            formulation = result['current_formulation']
            print(f"\n🧪 Formulation Details:")
            print(f"  Name: {formulation.get('name', 'N/A')}")
            print(f"  Type: {formulation.get('type', 'N/A')}")
            print(f"  Ingredients Count: {len(formulation.get('ingredients', []))}")
            print(f"  Validation Status: {formulation.get('validation_status', 'N/A')}")

        print(f"\n💬 AI Response:")
        print(f"  {result.get('response', 'No response')[:200]}...")

    except Exception as e:
        print(f"\n❌ Workflow execution failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_workflow()

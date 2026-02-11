from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

# Ensure tables are created
models.Base.metadata.create_all(bind=engine)
db = SessionLocal()

def seed_database():
    print("Starting database seeding...")

    # --- 1. Theory Questions (For the Mock Interview Room) ---
    theory_questions = [
        models.TheoryQuestion(
            subject="Operating Systems",
            question_text="Explain the concept of Virtual Memory and its benefits.",
            ideal_answer="Virtual memory is a memory management technique that uses hardware and software to allow a computer to compensate for physical memory shortages by temporarily transferring data from random access memory (RAM) to disk storage."
        ),
        models.TheoryQuestion(
            subject="Operating Systems",
            question_text="What is a Deadlock and what are the four necessary conditions for it to occur?",
            ideal_answer="A deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting for another resource held by some other process. Conditions: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait."
        ),
        models.TheoryQuestion(
            subject="Database Management",
            question_text="What is the difference between INNER JOIN and LEFT JOIN?",
            ideal_answer="INNER JOIN returns records that have matching values in both tables. LEFT JOIN returns all records from the left table, and the matched records from the right table; if no match, it returns NULL for the right side."
        ),
        models.TheoryQuestion(
            subject="Networking",
            question_text="Explain the 7 layers of the OSI Model.",
            ideal_answer="The 7 layers are: Physical, Data Link, Network, Transport, Session, Presentation, and Application. It is a conceptual framework used to understand network interactions."
        ),
        models.TheoryQuestion(
            subject="Object-Oriented Programming",
            question_text="Explain the four pillars of OOP.",
            ideal_answer="The four pillars are Encapsulation (hiding data), Abstraction (hiding complexity), Inheritance (reusing code), and Polymorphism (multiple forms of a function)."
        )
    ]

    # --- 2. Coding Questions (For the Technical Round) ---
    coding_questions = [
        models.CodingQuestion(
            title="Two Sum",
            description="Write a function solution(nums, target) that returns indices of the two numbers such that they add up to target. Assume exactly one solution exists.",
            initial_code="def solution(nums, target):\n    # Example: nums=[2,7,11,15], target=9 -> [0,1]\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n\nprint(solution([2, 7, 11, 15], 9))",
            test_case_input="[2, 7, 11, 15], 9",
            expected_output="[0, 1]"
        ),
        models.CodingQuestion(
            title="Check Palindrome",
            description="Write a function solution(s) that returns True if a string is a palindrome, and False otherwise.",
            initial_code="def solution(s):\n    # Your code here\n    return s == s[::-1]\n\nprint(solution('radar'))",
            test_case_input="'radar'",
            expected_output="True"
        ),
        models.CodingQuestion(
            title="Find Maximum",
            description="Write a function solution(arr) that returns the largest number in a list.",
            initial_code="def solution(arr):\n    return max(arr)\n\nprint(solution([1, 5, 3, 9, 2]))",
            test_case_input="[1, 5, 3, 9, 2]",
            expected_output="9"
        ),
        models.CodingQuestion(
            title="Factorial",
            description="Write a recursive function solution(n) to find the factorial of a number.",
            initial_code="def solution(n):\n    if n == 0: return 1\n    return n * solution(n-1)\n\nprint(solution(5))",
            test_case_input="5",
            expected_output="120"
        )
    ]

    # --- 3. Save to Database ---
    try:
        # Clear existing data to avoid duplicates if running seed multiple times
        db.query(models.TheoryQuestion).delete()
        db.query(models.CodingQuestion).delete()

        db.add_all(theory_questions)
        db.add_all(coding_questions)
        
        db.commit()
        print(f"Success! Seeded {len(theory_questions)} theory questions and {len(coding_questions)} coding challenges.")
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
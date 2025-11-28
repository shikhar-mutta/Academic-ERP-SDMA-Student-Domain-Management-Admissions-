# Program Name Requirements - Error Explanation

## What does "The program information is invalid" mean?

This error occurs when you try to **admit a student** to a domain, and the domain's **program name** doesn't match the expected format required for **roll number generation**.

---

## Why does this happen?

When a student is admitted, the system needs to generate a **roll number** automatically. The roll number is generated based on:

1. **Degree Type** - Extracted from the program name (e.g., B.Tech → "BT", M.Tech → "MT")
2. **Department** - Extracted from the program name (e.g., CSE, ECE, AIDS)
3. **Join Year** - The year the student joins
4. **Sequence Number** - Auto-incremented based on existing students

**Example Roll Number:** `BT2024001`
- `BT` = Bachelor of Technology
- `2024` = Join year
- `001` = First student in that department/year

If the program name doesn't contain recognizable degree and department information, the system cannot generate a roll number, hence the error.

---

## Program Name Requirements

Your domain's **Program** field must include:

### 1. A Valid Degree Type
The program name must contain **ONE** of these:

- **B.Tech** / **Bachelor of Technology**
- **M.Tech** / **Master of Technology**
- **IM.Tech** / **IMTECH** / **Integrated Master of Technology**
- **M.Sc** / **Master of Science**
- **Ph.D** / **PHD** / **Doctor of Philosophy**
- **Diploma** (will use "DP" prefix)

### 2. A Valid Department
The program name must contain **ONE** of these:

- **CSE** (Computer Science Engineering)
- **ECE** (Electronics and Communication Engineering)
- **AIDS** (Artificial Intelligence and Data Science)

---

## Valid Program Name Examples

✅ **Correct Examples:**
- "Bachelor of Technology in CSE"
- "B.Tech CSE"
- "Master of Technology in ECE"
- "M.Tech ECE"
- "B.Tech AIDS"
- "IM.Tech CSE"
- "Master of Science in CSE"
- "M.Sc ECE"
- "Ph.D in Computer Science"

❌ **Incorrect Examples:**
- "Computer Science" (missing degree type)
- "B.Tech" (missing department)
- "Engineering" (missing both degree type and department)
- "IT Engineering" (department "IT" not recognized)
- "Mechanical Engineering" (department "Mechanical" not recognized)

---

## How to Fix This Error

### If you're creating/editing a domain:

1. **Check the Program field** - Make sure it includes:
   - A degree type (B.Tech, M.Tech, etc.)
   - A department (CSE, ECE, or AIDS)

2. **Update the Program name** to follow the format:
   - Format: `[Degree Type] in [Department]` or `[Degree Type] [Department]`
   - Examples:
     - "Bachelor of Technology in CSE"
     - "B.Tech CSE"
     - "Master of Technology in ECE"

3. **Save the domain** and try admitting the student again.

### Current Error Messages:

**If degree type is missing:**
> "The program name must include a valid degree type (B.Tech, M.Tech, IM.Tech, M.Sc, or Ph.D). Examples: 'Bachelor of Technology in CSE', 'B.Tech CSE', 'Master of Technology in ECE'. Please update the program name to include one of these degree types."

**If department is missing:**
> "The program name must include a recognized department (CSE, ECE, or AIDS). Examples: 'Bachelor of Technology in CSE', 'B.Tech ECE', 'M.Tech AIDS'. Please update the program name to include one of these departments."

---

## Technical Details

### Degree Prefix Mapping:
- **B.Tech** → `BT`
- **M.Tech** → `MT`
- **IM.Tech** → `IM`
- **M.Sc** → `MS`
- **Ph.D** → `PH`
- **Diploma** → `DP`
- **Unrecognized** → `RN` (fallback)

### Department Roll Number Ranges:
- **CSE**: 001-200
- **ECE**: 501-600
- **AIDS**: 701-800

### Roll Number Format:
- Pattern: `[DegreePrefix][Year][Sequence]`
- Example: `BT2024001` = B.Tech student, joined 2024, first in CSE department

---

## Common Scenarios

### Scenario 1: Program name is too generic
```
Program: "Engineering"
Error: Missing both degree type and department
Fix: Change to "Bachelor of Technology in CSE"
```

### Scenario 2: Program name missing department
```
Program: "Bachelor of Technology"
Error: Missing department
Fix: Change to "Bachelor of Technology in CSE"
```

### Scenario 3: Program name missing degree type
```
Program: "Computer Science Engineering"
Error: Missing degree type
Fix: Change to "Bachelor of Technology in CSE"
```

### Scenario 4: Unsupported department
```
Program: "Bachelor of Technology in Mechanical Engineering"
Error: Department "Mechanical" not supported
Fix: Change to a supported department (CSE, ECE, or AIDS) or update the system
```

---

**Note:** The system currently supports only CSE, ECE, and AIDS departments. If you need to add more departments, the `RollNumberGenerator.java` file needs to be updated.


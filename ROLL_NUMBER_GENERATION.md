# Roll Number Generation Guide

## Overview

The system automatically generates roll numbers for students when they are admitted to a domain. The roll number format is: `[PREFIX][YEAR][SEQUENCE]`

**Example:** `BT2024001`
- `BT` = Bachelor of Technology prefix
- `2024` = Join year
- `001` = Sequence number (first student)

---

## Degree Type Prefixes

The system recognizes these degree types and assigns corresponding prefixes:

| Degree Type | Prefix | Examples |
|------------|--------|----------|
| B.Tech / Bachelor of Technology | `BT` | "Bachelor of Technology in CSE", "B.Tech CSE" |
| M.Tech / Master of Technology | `MT` | "Master of Technology in ECE", "M.Tech ECE" |
| IM.Tech / Integrated Master of Technology | `IM` | "IM.Tech CSE", "Integrated Master of Technology" |
| M.Sc / Master of Science | `MS` | "Master of Science in CSE", "M.Sc ECE" |
| Ph.D / Doctor of Philosophy | `PH` | "Ph.D in Computer Science", "Doctor of Philosophy" |
| Diploma | `DP` | "Diploma in Engineering", "Diploma in CSE" |
| **Unrecognized Degree Type** | **`RN`** | Any program that doesn't match the above |

### Fallback Behavior

If the program name doesn't contain any recognized degree type, the system will:
- ✅ **Use "RN" prefix** instead of throwing an error
- ✅ **Allow student admission to proceed**
- ✅ **Generate roll numbers like:** `RN2024001`, `RN2024002`, etc.

---

## Department Sequence Ranges

Each department has a specific sequence number range for roll numbers:

| Department | Sequence Range | Example Roll Numbers |
|-----------|---------------|---------------------|
| CSE (Computer Science Engineering) | 001-200 | BT2024001, BT2024002, ... BT2024200 |
| ECE (Electronics and Communication Engineering) | 501-600 | MT2024501, MT2024502, ... MT2024600 |
| AIDS (Artificial Intelligence and Data Science) | 701-800 | BT2024701, BT2024702, ... BT2024800 |
| **Unrecognized Department** | **900-999** | RN2024900, RN2024901, ... RN2024999 |

### Fallback Behavior

If the program name doesn't contain any recognized department (CSE, ECE, AIDS), the system will:
- ✅ **Use default range 900-999** instead of throwing an error
- ✅ **Allow student admission to proceed**
- ✅ **Generate roll numbers like:** `RN2024900`, `RN2024901`, etc.

---

## Roll Number Generation Logic

### Step-by-Step Process

1. **Extract Degree Prefix**
   - System checks the program name for recognized degree types
   - If found, uses corresponding prefix (BT, MT, IM, MS, PH)
   - If not found, uses fallback prefix **"RN"**

2. **Determine Department Range**
   - System checks the program name for recognized departments (CSE, ECE, AIDS)
   - If found, uses corresponding sequence range
   - If not found, uses fallback range **900-999**

3. **Build Roll Base**
   - Format: `[PREFIX][YEAR]`
   - Example: `BT2024`, `RN2024`

4. **Find Next Sequence**
   - Searches existing roll numbers with the same prefix and year
   - Finds the highest sequence number within the department range
   - Increments by 1 for the new student

5. **Generate Final Roll Number**
   - Format: `[PREFIX][YEAR][SEQUENCE]`
   - Example: `BT2024001`, `RN2024900`

---

## Examples

### Example 1: Valid Program Name
```
Program: "Bachelor of Technology in CSE"
Degree Prefix: BT (recognized)
Department Range: 001-200 (CSE)
Roll Number: BT2024001
```

### Example 2: Diploma
```
Program: "Diploma in Engineering"
Degree Prefix: DP (Diploma recognized)
Department Range: 900-999 (no department found)
Roll Number: DP2024900
```

### Example 3: Unrecognized Degree Type
```
Program: "Certificate Course"
Degree Prefix: RN (fallback - not recognized)
Department Range: 900-999 (no department found)
Roll Number: RN2024900
```

### Example 4: Unrecognized Department
```
Program: "Bachelor of Technology in Mechanical Engineering"
Degree Prefix: BT (recognized)
Department Range: 900-999 (fallback - department not recognized)
Roll Number: BT2024900
```

### Example 5: Both Unrecognized
```
Program: "Certificate Course"
Degree Prefix: RN (fallback)
Department Range: 900-999 (fallback)
Roll Number: RN2024900
```

---

## Benefits of Fallback System

✅ **No Errors**: Students can be admitted even if program names don't match exact formats
✅ **Flexibility**: System accommodates new or non-standard program names
✅ **Automatic Roll Numbers**: Every student gets a roll number, regardless of program format
✅ **Consistent Format**: All roll numbers follow the same structure
✅ **Easy Identification**: "RN" prefix clearly indicates non-standard programs

---

## Important Notes

1. **RN Prefix Meaning**: "RN" stands for "Roll Number" and indicates that the degree type was not recognized in the standard list.

2. **Default Range**: The 900-999 range is reserved for unrecognized departments and prevents conflicts with standard department ranges.

3. **Capacity Checking**: The system still checks if the sequence range is exhausted. If you reach 999 in the default range, you'll get a "Seat range exhausted" error.

4. **Best Practice**: While the system accepts any program name, it's recommended to use standard formats like:
   - "Bachelor of Technology in CSE"
   - "Master of Technology in ECE"
   - "B.Tech AIDS"

   This ensures proper prefix assignment and avoids using the fallback ranges.

---

## Troubleshooting

### Q: Why is my student getting an "RN" prefix?
**A:** The program name doesn't contain any recognized degree type (B.Tech, M.Tech, IM.Tech, M.Sc, Ph.D). Update the program name to include one of these degree types.

### Q: Why is my student getting a sequence number in the 900-999 range?
**A:** The program name doesn't contain any recognized department (CSE, ECE, AIDS). Update the program name to include one of these departments.

### Q: Can I change a student's roll number after admission?
**A:** Roll numbers are auto-generated and should not be manually changed as they are used for identification and tracking.

---

**Last Updated:** After implementing fallback prefix and range system


# 🧪 Amrutam Telemedicine - End-to-End Demo Guide

Follow these steps to experience the complete booking flow from scratch.

## 0. Boot the System
Run the following command in your terminal:
```bash
docker compose up --build
```
The API is now live at `http://localhost:3000`.

---

## Step 1: Register as a Doctor 👨‍⚕️
**Endpoint**: `POST /api/v1/auth/register`

**Payload**:
```json
{
  "email": "dr.sharma@amrutam.com",
  "password": "SecurePassword123",
  "fullName": "Dr. Vivek Sharma",
  "phone": "9812345678",
  "role": "doctor",
  "specialization": "Dermatology",
  "fee": 800
}
```
**Action**: Save the `token` from the response. This is your **Doctor Token**.

---

## Step 2: Set Availability (As Doctor) 📅
**Endpoint**: `POST /api/v1/doctors/availability/`
**Header**: `Authorization: Bearer <DOCTOR_TOKEN>`

**Payload**:
```json
{
  "slots": [
    {
      "start_time": "2026-04-15T09:00:00Z",
      "end_time": "2026-04-15T10:00:00Z"
    }
  ]
}
```
**Action**: Note the `id` of the created slot. This is your **Slot ID**.

---

## Step 3: Register as a Patient 🧑‍Patient
**Endpoint**: `POST /api/v1/auth/register`

**Payload**:
```json
{
  "email": "jane.smith@email.com",
  // any password here,
  "fullName": "Jane Smith",
  "phone": "9001112223",
  "role": "patient"
}
```
**Action**: Save the `token`. This is your **Patient Token**.

---

## Step 4: Search for the Doctor (As Patient) 🔍
**Endpoint**: `GET /api/v1/doctors/search?search=Vivek`
**Header**: `Authorization: Bearer <PATIENT_TOKEN>`

**Action**: Confirm you see "Dr. Vivek Sharma" in the list. Note the `user_id`. This is the **Doctor ID**.

---

## Step 5: Book an Appointment (As Patient) ✅
**Endpoint**: `POST /api/v1/appointments/book`
**Header**: 
- `Authorization: Bearer <PATIENT_TOKEN>`
- `X-Idempotency-Key: demo-run-2-unique-key`

**Payload**:
```json
{
  "slot_id": "<SLOT_ID_FROM_STEP_2>"
}
```

> [!TIP]
> **Important**: The `X-Idempotency-Key` must be unique for every *new* booking. If you hit the endpoint again with the same key, the server will block it to prevent "double-booking" the same slot by accident. Change this key (e.g., use a random number) for every new test!

---

## Step 6: Verify the Appointment 🏥
**Endpoint**: `GET /api/v1/appointments/me`
**Header**: `Authorization: Bearer <PATIENT_TOKEN>`

**Action**: You should see your confirmed appointment!

---

## Step 7: Register as an Admin (Optional) 🛡️
**Endpoint**: `POST /api/v1/auth/register`

**Payload**:
```json
{
  "email": "super.admin@amrutam.com",
  // any password here,
  "fullName": "Global Admin",
  "phone": "9998887776",
  "role": "admin"
}
```
**Action**: Use this token to access the Administrative Dashboard!

---

## Step 8: Complete the Consultation (As Doctor) 💊
**Endpoint**: `POST /api/v1/consultations/<CONSULTATION_ID>/prescribe`
**Header**: `Authorization: Bearer <DOCTOR_TOKEN>`

**Payload**:
```json
{
  "medication_details": "Apply Amrutam Kumkumadi Oil twice daily after cleansing."
}
```

**Action**: Verify that the consultation status changes to `completed` in the database!

---

## Step 9: Simulate Payment (As Patient) 💳
**Endpoint**: `POST /api/v1/payments/capture`
**Header**: `Authorization: Bearer <PATIENT_TOKEN>`

**Payload**:
```json
{
  "consultation_id": "<YOUR_CONSULTATION_ID>",
  "amount": 800
}
```

**Action**: Confirm the "captured" status! You've now completed the full business cycle. 

---

## ✨ Pro Tip: Audit Logs
As an Admin, you can verify the entire trail:
**Endpoint**: `GET /api/v1/admin/audit-logs`
**Header**: `Authorization: Bearer <ADMIN_TOKEN>`

You will see every action (`REGISTER`, `SET_AVAILABILITY`, `BOOK_APPOINTMENT`, `ISSUE_PRESCRIPTION`, `CAPTURE_PAYMENT`) tracked with full JSON payloads.

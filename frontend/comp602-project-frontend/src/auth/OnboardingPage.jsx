import { useState } from "react";
import BASE_URL from "../config.js";
import "./OnboardingPage.css";

const STEPS = [                                                                     // Each step defines one screen in the onboarding flow
    {
        field: "displayName",
        title: "What's your name?",
        subtitle: "How you'll appear to others on Connectly.",
        type: "text",
        placeholder: "Display name",
        required: true,
        autoCapitalize: "words",
    },
    {
        field: "email",
        title: "What's your email?",
        subtitle: "Used for account security and recovery.",
        type: "text",
        placeholder: "e.g. leo@example.com",
        required: true,
        autoCapitalize: "none",
    },
    {
        field: "emailOtp",
        title: "Verify your email.",
        subtitle: "Enter the 6-character code sent to your email.",
        type: "otp",
        placeholder: "Enter code",
        required: true,
        autoCapitalize: "characters",
    },
    {
        field: "industry",
        title: "What do you do?",
        subtitle: "Your profession or field of work.",
        type: "text",
        placeholder: "e.g. Software Engineer",
        required: true,
        autoCapitalize: "words",
    },
    {
        field: "city",
        title: "Where are you based?",
        subtitle: "We'll use this to find people near you.",
        type: "text",
        placeholder: "e.g. Auckland",
        required: true,
        autoCapitalize: "words",
    },
    {
        field: "skills",
        title: "What are your skills?",
        subtitle: "Add up to 10 skills.",
        type: "tags",
        placeholder: "e.g. React, Java, Design...",
        required: false,
    },
    {
        field: "bio",
        title: "Tell us about yourself.",
        subtitle: "You can always update this later.",
        type: "textarea",
        placeholder: "A short bio...",
        required: false,
    },
];

export default function OnboardingPage({ currentUser, onComplete }) {
    const [step, setStep] = useState(0);
    const [animKey, setAnimKey] = useState(0);
    const [slideDir, setSlideDir] = useState("forward");
    const [values, setValues] = useState({ displayName: "", email: "", emailOtp: "", industry: "", city: "", skills: [], bio: "" });
    const [skillInput, setSkillInput] = useState("");                               // Controlled input for the skills tag field
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const current = STEPS[step];                                                    // The current step object
    const isLast = step === STEPS.length - 1;
    const progress = (step / (STEPS.length - 1)) * 100;                            // Progress bar percentage

    const addSkill = () => {                                                        // Add a skill tag if valid
        const trimmed = skillInput.trim();
        if (!trimmed || trimmed.length > 25 || values.skills.includes(trimmed) || values.skills.length >= 10) return;
        setValues(v => ({ ...v, skills: [...v.skills, trimmed] }));
        setSkillInput("");
    };

    const removeSkill = (skill) => setValues(v => ({ ...v, skills: v.skills.filter(s => s !== skill) }));

    const goTo = (nextStep, dir) => {                                               // Navigate to a step with the correct slide direction
        setSlideDir(dir);
        setAnimKey(k => k + 1);
        setStep(nextStep);
        setError(null);
    };

    const handleNext = async () => {
        setError(null);
        const val = current.field === "skills" ? values.skills : values[current.field];
        if (current.required && (!val || val.toString().trim() === "")) {
            setError("This field is required to continue.");
            return;
        }

        if (step === 1) {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/auth/send-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: values.email })
            });
            if (res.status === 409) {
                setError("This email is already in taken. Select a new one.");
                setLoading(false);
                return;
            }
            if (!res.ok) {
                setError("Could not send verification code. Please try again.");
                setLoading(false);
                return;
            }
        } catch {
            setError("Could not send verification code. Please try again.");
            setLoading(false);
            return;
        }
        setLoading(false);
    }

        if (step === 2) {                                                           // Verify the OTP code before proceeding
            setLoading(true);
            try {
                const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: values.email, code: values.emailOtp.toUpperCase(), context: 'email_verify' })
                });
                if (!res.ok) {
                    setError("Invalid or expired code. Please try again.");
                    setLoading(false);
                    return;
                }
            } catch {
                setError("Could not verify code. Please try again.");
                setLoading(false);
                return;
            }
            setLoading(false);
        }

        if (step === 4) {                                                           // Validate city against Nominatim before proceeding
            setLoading(true);
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(values.city)}&format=json&limit=1`,
                    { headers: { "Accept-Language": "en" } }
                );
                const data = await res.json();
                if (!data || data.length === 0) {
                    setError("Could not find that city. Please enter a real city name.");
                    setLoading(false);
                    return;
                }
            } catch {
                setError("Could not verify city. Please try again.");
                setLoading(false);
                return;
            }
            setLoading(false);
        }

        if (isLast) { await handleSubmit(); return; }
        goTo(step + 1, "forward");
    };

    const handleBack = () => goTo(step - 1, "back");

    const handleSkip = () => {                                                      // Skip optional steps or finish on the last step
        if (isLast) { handleSubmit(); return; }
        goTo(step + 1, "forward");
    };

    const handleResendCode = async () => {                                          // Resend OTP if the user didn't receive it or it expired
        setError(null);
        setLoading(true);
        try {
            await fetch(`${BASE_URL}/auth/send-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: values.email })
            });
            setError("Code resent. Check your email.");
        } catch {
            setError("Could not resend code. Please try again.");
        }
        setLoading(false);
    };

    const handleSubmit = async () => {                                              // Submit all collected values to the profile endpoint
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${BASE_URL}/users/profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "userId": currentUser.userId },
                body: JSON.stringify({
                    displayName: values.displayName,
                    email:       values.email,
                    industry:    values.industry,
                    city:        values.city,
                    bio:         values.bio,
                    skills:      values.skills.join(", "),
                }),
            });

            if (!res.ok) { setError("Something went wrong. Please try again."); setLoading(false); return; }

            const updated = await res.json();
            onComplete(updated);                                                    // Pass the completed user back to App.jsx
        } catch { setError("Could not connect to server."); setLoading(false); }
    };

    return (
        <div className="ob-page">
            <div className="ob-card">

                {/* Progress bar - fills left to right as steps complete */}
                <div className="ob-progress-track">
                    <div className="ob-progress-fill" style={{ width: `${progress}%` }} />
                </div>

                {/* This div re-creates itself on every step change, which replays the slide animation */}
                <div className={`ob-content ob-slide-${slideDir}`} key={animKey}>
                    <p className="ob-step-label">Step {step + 1} of {STEPS.length}</p>
                    <h1 className="ob-title">{current.title}</h1>
                    <p className="ob-subtitle">{current.subtitle}</p>

                    {current.type === "text" && (
                        <input
                            className={`ob-input${error ? " ob-input--error" : ""}`}
                            type="text"
                            placeholder={current.placeholder}
                            value={values[current.field]}
                            autoCapitalize={current.autoCapitalize}
                            autoCorrect="off"
                            onChange={e => { setValues(v => ({ ...v, [current.field]: e.target.value })); setError(null); }}
                            onKeyDown={e => e.key === "Enter" && handleNext()}
                        />
                    )}

                    {current.type === "otp" && (                                    /* OTP verification input - uppercase, 6 char max */
                        <div className="flex flex-col gap-3">
                            <input
                                className={`ob-input${error ? " ob-input--error" : ""}`}
                                type="text"
                                placeholder={current.placeholder}
                                value={values[current.field]}
                                autoCapitalize="characters"
                                autoCorrect="off"
                                maxLength={6}
                                onChange={e => { setValues(v => ({ ...v, [current.field]: e.target.value.toUpperCase() })); setError(null); }}
                                onKeyDown={e => e.key === "Enter" && handleNext()}
                            />
                            <button
                                className="ob-skip"
                                style={{ position: 'static', transform: 'none', alignSelf: 'flex-start' }}
                                onClick={handleResendCode}
                                disabled={loading}
                            >
                                Resend code
                            </button>
                        </div>
                    )}

                    {current.type === "textarea" && (
                        <textarea
                            className="ob-input ob-textarea"
                            placeholder={current.placeholder}
                            value={values[current.field]}
                            rows={4}
                            onChange={e => setValues(v => ({ ...v, [current.field]: e.target.value }))}
                        />
                    )}

                    {current.type === "tags" && (
                        <div className="ob-tags-section">
                            <div className="ob-tags-input-row">
                                <input
                                    className="ob-input"
                                    type="text"
                                    placeholder={current.placeholder}
                                    value={skillInput}
                                    autoCapitalize="words"
                                    onChange={e => setSkillInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                                />
                                <button className="ob-add-btn" onClick={addSkill}>Add</button>
                            </div>
                            {values.skills.length > 0 && (                          /* Only render tags list if there are tags */
                                <div className="ob-tags">
                                    {values.skills.map(skill => (
                                        <span key={skill} className="ob-tag">
                                            {skill}
                                            <button className="ob-tag-remove" onClick={() => removeSkill(skill)}>x</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {error && <p className="ob-error">{error}</p>}
                </div>

                {/* Navigation buttons */}
                <div className="ob-actions">
                    {step > 0 && (
                        <button className="ob-back-btn" onClick={handleBack} disabled={loading}>Back</button>
                    )}
                    <button className="ob-next-btn" onClick={handleNext} disabled={loading}>
                        {loading ? "Please wait..." : isLast ? "Get Started" : "Continue"}
                    </button>
                </div>

                {/* Only optional steps show the skip button */}
                {!current.required && (
                    <button className="ob-skip" onClick={handleSkip} disabled={loading}>
                        Skip for now
                    </button>
                )}

            </div>
        </div>
    );
}
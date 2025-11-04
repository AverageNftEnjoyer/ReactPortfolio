import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Github, Linkedin, FileText, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"; 



function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={`absolute ${className ?? ""}`}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-r to-transparent ${gradient} backdrop-blur-[2px] border-2 border-white/[0.15] shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] after:absolute after:inset-0 after:rounded-full after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]`}
        />
      </motion.div>
    </motion.div>
  )
}


export default function Portfolio() {
  const [typingText, setTypingText] = useState("")
  const fullText = "// Based in Pittsburgh"

  // Refs for scroll animations
  const aboutRef = useRef<HTMLDivElement>(null)
  const experienceRef = useRef<HTMLDivElement>(null)
  const certificationsRef = useRef<HTMLDivElement>(null)
  const projectsRef = useRef<HTMLDivElement>(null)
  const skillsRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypingText(fullText.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [])

useEffect(() => {
  const observerOptions = {
    threshold: 0.3,
    rootMargin: "0px 0px -50px 0px",
  };

  const handleAnimateEnd = (entry) => {
    entry.target.classList.remove("animate-slide-in-up");
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (
        entry.isIntersecting &&
        !entry.target.classList.contains("animated-once")
      ) {
        entry.target.classList.add("animate-slide-in-up", "animated-once");
        entry.target.classList.remove("opacity-0", "translate-y-8");
        entry.target.addEventListener("animationend", () => handleAnimateEnd(entry), { once: true });
      }
    });
  }, observerOptions);

  const refs = [aboutRef, experienceRef, certificationsRef, projectsRef, skillsRef];
  refs.forEach((ref) => {
    if (ref.current) {
      observer.observe(ref.current);
    }
  });

  return () => observer.disconnect();
}, []);



  // Smooth scroll function
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" })
  }

  const frontendSkills = [
    { name: "HTML", level: "Experienced" },
    { name: "CSS", level: "Experienced" },
    { name: "JavaScript", level: "Intermediate" },
    { name: "Python", level: "Experienced" },
    { name: "TypeScript", level: "Intermediate" },
    { name: "React", level: "Experienced" },
  ]

  const backendSkills = [
    { name: "Databricks", level: "Experienced" },
    { name: "MySQL", level: "Experienced" },
    { name: "Java", level: "Intermediate" },
    { name: "Oracle", level: "Intermediate" },
    { name: "Node.JS", level: "Intermediate" },
    { name: "Snowflake", level: "Learning" },
  ]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="aurora aurora-1"></div>
        <div className="aurora aurora-2"></div>
        <div className="aurora aurora-3"></div>
        <div className="aurora aurora-4"></div>
      </div>
         
      {/* Floating Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Original white stars */}
        <div className="floating-star star-1"></div>
        <div className="floating-star star-2"></div>
        <div className="floating-star star-3"></div>
        <div className="floating-star star-4"></div>
        <div className="floating-star star-5"></div>
        <div className="floating-star star-6"></div>
        <div className="floating-star star-7"></div>
        <div className="floating-star star-8"></div>
        <div className="floating-star star-9"></div>
        <div className="floating-star star-10"></div>
        <div className="floating-star star-11"></div>
        <div className="floating-star star-12"></div>
        <div className="floating-star star-13"></div>
        <div className="floating-star star-14"></div>
        <div className="floating-star star-15"></div>
        <div className="floating-star star-16"></div>
        <div className="floating-star star-17"></div>
        <div className="floating-star star-18"></div>
        <div className="floating-star star-19"></div>
        <div className="floating-star star-20"></div>
        <div className="floating-star star-21"></div>
        <div className="floating-star star-22"></div>
        <div className="floating-star star-23"></div>
        <div className="floating-star star-24"></div>
        <div className="floating-star star-25"></div>
        <div className="floating-star star-26"></div>
        <div className="floating-star star-27"></div>
        <div className="floating-star star-28"></div>
        <div className="floating-star star-29"></div>
        <div className="floating-star star-30"></div>
        <div className="floating-star star-31"></div>
        <div className="floating-star star-32"></div>
        <div className="floating-star star-33"></div>
        <div className="floating-star star-34"></div>
        <div className="floating-star star-35"></div>

        {/* Pink stars */}
        <div className="floating-star-pink pink-star-1"></div>
        <div className="floating-star-pink pink-star-2"></div>
        <div className="floating-star-pink pink-star-3"></div>
        <div className="floating-star-pink pink-star-4"></div>
        <div className="floating-star-pink pink-star-5"></div>
        <div className="floating-star-pink pink-star-6"></div>
        <div className="floating-star-pink pink-star-7"></div>
        <div className="floating-star-pink pink-star-8"></div>
        <div className="floating-star-pink pink-star-9"></div>
        <div className="floating-star-pink pink-star-10"></div>
        <div className="floating-star-pink pink-star-11"></div>
        <div className="floating-star-pink pink-star-12"></div>

        {/* Blue stars */}
        <div className="floating-star-blue blue-star-1"></div>
        <div className="floating-star-blue blue-star-2"></div>
        <div className="floating-star-blue blue-star-3"></div>
        <div className="floating-star-blue blue-star-4"></div>
        <div className="floating-star-blue blue-star-5"></div>
        <div className="floating-star-blue blue-star-6"></div>
        <div className="floating-star-blue blue-star-7"></div>
        <div className="floating-star-blue blue-star-8"></div>
        <div className="floating-star-blue blue-star-9"></div>
        <div className="floating-star-blue blue-star-10"></div>
        <div className="floating-star-blue blue-star-11"></div>
        <div className="floating-star-blue blue-star-12"></div>

        {/* Yellow stars */}
        <div className="floating-star-yellow yellow-star-1"></div>
        <div className="floating-star-yellow yellow-star-2"></div>
        <div className="floating-star-yellow yellow-star-3"></div>
        <div className="floating-star-yellow yellow-star-4"></div>
        <div className="floating-star-yellow yellow-star-5"></div>
        <div className="floating-star-yellow yellow-star-6"></div>
        <div className="floating-star-yellow yellow-star-7"></div>
        <div className="floating-star-yellow yellow-star-8"></div>
        <div className="floating-star-yellow yellow-star-9"></div>
        <div className="floating-star-yellow yellow-star-10"></div>
        <div className="floating-star-yellow yellow-star-11"></div>
        <div className="floating-star-yellow yellow-star-12"></div>

        {/* Additional stars around hero text */}
        <div className="floating-star hero-star-1"></div>
        <div className="floating-star hero-star-2"></div>
        <div className="floating-star hero-star-3"></div>
        <div className="floating-star hero-star-4"></div>
        <div className="floating-star hero-star-5"></div>
        <div className="floating-star hero-star-6"></div>
        <div className="floating-star hero-star-7"></div>
        <div className="floating-star hero-star-8"></div>
        <div className="floating-star hero-star-9"></div>
        <div className="floating-star hero-star-10"></div>
        <div className="floating-star hero-star-11"></div>
        <div className="floating-star hero-star-12"></div>
        <div className="floating-star hero-star-13"></div>
        <div className="floating-star hero-star-14"></div>
        <div className="floating-star hero-star-15"></div>

       {/* Shooting Stars */}
<div className="shooting-star shooting-star-1"></div>
{/* Hero Shooting Star */}
<div className="shooting-star hero-shooting-star-1"></div>
      </div>

      <style>{`
       @keyframes slide-in-up {
  from { opacity: 0; transform: translateY(2rem); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-slide-in-up {
  animation: slide-in-up 0.6s ease-out forwards;
}


        @keyframes aurora {
          0%, 100% { 
            transform: translateX(-100%) translateY(-50%) rotate(0deg);
            opacity: 0.3;
          }
          25% { 
            transform: translateX(-50%) translateY(-25%) rotate(90deg);
            opacity: 0.6;
          }
          50% { 
            transform: translateX(0%) translateY(-50%) rotate(180deg);
            opacity: 0.4;
          }
          75% { 
            transform: translateX(50%) translateY(-75%) rotate(270deg);
            opacity: 0.7;
          }
        }

        .aurora {
          position: absolute;
          width: 200%;
          height: 200%;
          border-radius: 50%;
          filter: blur(60px);
          animation: aurora 20s infinite linear;
        }

      .aurora-1 {
  background: radial-gradient(ellipse at 40% 60%, rgba(236, 72, 153, 0.55) 0%, transparent 75%);
  top: -50%;
  left: -50%;
  animation-delay: 0s;
  animation-duration: 24s;
}

.aurora-2 {
  background: radial-gradient(ellipse at 70% 40%, rgba(59, 130, 246, 0.50) 0%, transparent 80%);
  top: -30%;
  right: -55%;
  animation-delay: -10s;
  animation-duration: 32s;
  animation-direction: reverse;
}

.aurora-3 {
  background: radial-gradient(ellipse at 60% 70%, rgba(236, 72, 153, 0.30) 0%, transparent 80%);
  bottom: -45%;
  left: -40%;
  animation-delay: -18s;
  animation-duration: 36s;
}

.aurora-4 {
  background: radial-gradient(ellipse at 80% 30%, rgba(59, 130, 246, 0.35) 0%, transparent 80%);
  bottom: -25%;
  right: -35%;
  animation-delay: -20s;
  animation-duration: 28s;
  animation-direction: reverse;
}


        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px);
            opacity: 0.4;
          }
          25% { 
            transform: translateY(-20px) translateX(10px);
            opacity: 1;
          }
          50% { 
            transform: translateY(-10px) translateX(-15px);
            opacity: 0.6;
          }
          75% { 
            transform: translateY(-25px) translateX(5px);
            opacity: 0.8;
          }
        }

        @keyframes floatAround {
          0% { 
            transform: translate(0, 0);
            opacity: 0.3;
          }
          25% { 
            transform: translate(30px, -40px);
            opacity: 1;
          }
          50% { 
            transform: translate(-20px, -80px);
            opacity: 0.5;
          }
          75% { 
            transform: translate(40px, -60px);
            opacity: 0.8;
          }
          100% { 
            transform: translate(0, 0);
            opacity: 0.3;
          }
        }

        .floating-star {
          position: absolute;
          width: 3px;
          height: 3px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.9);
        }

        .star-1 { top: 10%; left: 15%; animation: float 4s infinite; animation-delay: 0s; }
        .star-2 { top: 20%; left: 80%; animation: floatAround 6s infinite; animation-delay: 0.5s; }
        .star-3 { top: 30%; left: 25%; animation: float 5s infinite; animation-delay: 1s; }
        .star-4 { top: 15%; left: 60%; animation: floatAround 4.5s infinite; animation-delay: 1.5s; }
        .star-5 { top: 45%; left: 10%; animation: float 3.5s infinite; animation-delay: 2s; }
        .star-6 { top: 35%; left: 90%; animation: floatAround 5.5s infinite; animation-delay: 0.3s; }
        .star-7 { top: 60%; left: 30%; animation: float 4.2s infinite; animation-delay: 1.2s; }
        .star-8 { top: 50%; left: 75%; animation: floatAround 3.8s infinite; animation-delay: 0.8s; }
        .star-9 { top: 70%; left: 20%; animation: float 5.2s infinite; animation-delay: 1.8s; }
        .star-10 { top: 80%; left: 85%; animation: floatAround 4.8s infinite; animation-delay: 0.2s; }
        .star-11 { top: 25%; left: 45%; animation: float 3.2s infinite; animation-delay: 1.3s; }
        .star-12 { top: 65%; left: 55%; animation: floatAround 5.8s infinite; animation-delay: 0.7s; }
        .star-13 { top: 85%; left: 40%; animation: float 4.5s infinite; animation-delay: 1.7s; }
        .star-14 { top: 5%; left: 35%; animation: floatAround 3.5s infinite; animation-delay: 0.9s; }
        .star-15 { top: 75%; left: 70%; animation: float 5.5s infinite; animation-delay: 1.4s; }
        .star-16 { top: 40%; left: 5%; animation: floatAround 4.2s infinite; animation-delay: 0.6s; }
        .star-17 { top: 55%; left: 95%; animation: float 3.8s infinite; animation-delay: 1.1s; }
        .star-18 { top: 90%; left: 15%; animation: floatAround 5.2s infinite; animation-delay: 0.4s; }
        .star-19 { top: 12%; left: 50%; animation: float 4.8s infinite; animation-delay: 1.6s; }
        .star-20 { top: 68%; left: 8%; animation: floatAround 3.2s infinite; animation-delay: 1.9s; }
        .star-21 { top: 18%; left: 12%; animation: float 3.8s infinite; animation-delay: 0.4s; }
        .star-22 { top: 28%; left: 88%; animation: floatAround 4.2s infinite; animation-delay: 1.1s; }
        .star-23 { top: 38%; left: 22%; animation: float 5.1s infinite; animation-delay: 0.9s; }
        .star-24 { top: 48%; left: 78%; animation: floatAround 3.6s infinite; animation-delay: 1.8s; }
        .star-25 { top: 58%; left: 15%; animation: float 4.4s infinite; animation-delay: 0.6s; }
        .star-26 { top: 68%; left: 82%; animation: floatAround 5.3s infinite; animation-delay: 1.3s; }
        .star-27 { top: 78%; left: 25%; animation: float 3.9s infinite; animation-delay: 2.1s; }
        .star-28 { top: 88%; left: 75%; animation: floatAround 4.7s infinite; animation-delay: 0.8s; }
        .star-29 { top: 8%; left: 45%; animation: float 5.5s infinite; animation-delay: 1.5s; }
        .star-30 { top: 22%; left: 65%; animation: floatAround 3.3s infinite; animation-delay: 0.3s; }
        .star-31 { top: 42%; left: 8%; animation: float 4.1s infinite; animation-delay: 1.9s; }
        .star-32 { top: 52%; left: 92%; animation: floatAround 5.7s infinite; animation-delay: 0.7s; }
        .star-33 { top: 62%; left: 38%; animation: float 3.7s infinite; animation-delay: 1.6s; }
        .star-34 { top: 72%; left: 58%; animation: floatAround 4.9s infinite; animation-delay: 0.5s; }
        .star-35 { top: 92%; left: 48%; animation: float 5.9s infinite; animation-delay: 1.2s; }

        .hero-star-1 { top: 35%; left: 20%; animation: float 3.5s infinite; animation-delay: 0.2s; }
        .hero-star-2 { top: 40%; left: 75%; animation: floatAround 4.2s infinite; animation-delay: 1.1s; }
        .hero-star-3 { top: 45%; left: 15%; animation: float 5.1s infinite; animation-delay: 0.8s; }
        .hero-star-4 { top: 50%; left: 80%; animation: floatAround 3.8s infinite; animation-delay: 1.5s; }
        .hero-star-5 { top: 55%; left: 25%; animation: float 4.5s infinite; animation-delay: 0.5s; }
        .hero-star-6 { top: 60%; left: 70%; animation: floatAround 5.2s infinite; animation-delay: 1.8s; }
        .hero-star-7 { top: 30%; left: 30%; animation: float 3.2s infinite; animation-delay: 1.3s; }
        .hero-star-8 { top: 35%; left: 65%; animation: floatAround 4.8s infinite; animation-delay: 0.7s; }
        .hero-star-9 { top: 65%; left: 35%; animation: float 5.5s infinite; animation-delay: 1.6s; }
        .hero-star-10 { top: 25%; left: 50%; animation: floatAround 3.9s infinite; animation-delay: 0.4s; }
        .hero-star-11 { top: 70%; left: 60%; animation: float 4.1s infinite; animation-delay: 1.9s; }
        .hero-star-12 { top: 28%; left: 40%; animation: floatAround 5.7s infinite; animation-delay: 0.6s; }
        .hero-star-13 { top: 58%; left: 45%; animation: float 3.6s infinite; animation-delay: 1.4s; }
        .hero-star-14 { top: 32%; left: 55%; animation: floatAround 4.3s infinite; animation-delay: 0.9s; }
        .hero-star-15 { top: 62%; left: 50%; animation: float 5.8s infinite; animation-delay: 1.7s; }

        @keyframes shootingStarTopLeft {
          0% {
            transform: translate(-50px, -50px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(100vw, 100vh);
            opacity: 0;
          }
        }

        @keyframes shootingStarTopRight {
          0% {
            transform: translate(50px, -50px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(-100vw, 100vh);
            opacity: 0;
          }
        }

        @keyframes shootingStarBottomLeft {
          0% {
            transform: translate(-50px, 50px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(100vw, -100vh);
            opacity: 0;
          }
        }

        @keyframes shootingStarBottomRight {
          0% {
            transform: translate(50px, 50px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(-100vw, -100vh);
            opacity: 0;
          }
        }

      .shooting-star {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #fbbf24;
  border-radius: 50%;
  box-shadow: 0 0 12px #fbbf24, 0 0 20px #fde68a;
  opacity: 0.75;
}

.shooting-star::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 22px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #fbbf24, transparent);
  transform: translate(-50%, -50%) rotate(-45deg);
  border-radius: 2px;
  box-shadow: none;
  opacity: 0.5;
}



        .shooting-star-1 {
  top: 20%;
  left: 10%;
  animation: shootingStarTopLeft 12s infinite;
  animation-delay: 2s;
}

.hero-shooting-star-1 {
  top: 35%;
  left: 5%;
  animation: shootingStarTopLeft 16s infinite;
  animation-delay: 1s;
}


        .floating-star-pink {
          position: absolute;
          border-radius: 50%;
          background: #ec4899;
          box-shadow: 0 0 8px rgba(236, 72, 153, 0.9);
        }

        .floating-star-blue {
          position: absolute;
          border-radius: 50%;
          background: #3b82f6;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.9);
        }

        .floating-star-yellow {
          position: absolute;
          border-radius: 50%;
          background: #fbbf24;
          box-shadow: 0 0 8px rgba(251, 191, 36, 0.9);
        }
          .nav-underline {
    display: block;
    height: 2px;
    width: 0;
    margin-top: 3px;
    background: linear-gradient(90deg, #3b82f6 0%, #ec4899 100%);
    border-radius: 1px;
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

.group:hover .nav-underline,
.group:focus .nav-underline {
  width: 100%;
}


        /* Pink star positions and sizes */
        .pink-star-1 { top: 8%; left: 12%; width: 2px; height: 2px; animation: float 3.8s infinite; animation-delay: 0.2s; }
        .pink-star-2 { top: 18%; left: 78%; width: 4px; height: 4px; animation: floatAround 5.2s infinite; animation-delay: 1.1s; }
        .pink-star-3 { top: 28%; left: 22%; width: 3px; height: 3px; animation: float 4.1s infinite; animation-delay: 0.8s; }
        .pink-star-4 { top: 38%; left: 88%; width: 2px; height: 2px; animation: floatAround 3.5s infinite; animation-delay: 1.5s; }
        .pink-star-5 { top: 48%; left: 8%; width: 5px; height: 5px; animation: float 4.8s infinite; animation-delay: 0.5s; }
        .pink-star-6 { top: 58%; left: 92%; width: 3px; height: 3px; animation: floatAround 5.5s infinite; animation-delay: 1.8s; }
        .pink-star-7 { top: 68%; left: 28%; width: 2px; height: 2px; animation: float 3.2s infinite; animation-delay: 1.3s; }
        .pink-star-8 { top: 78%; left: 72%; width: 4px; height: 4px; animation: floatAround 4.5s infinite; animation-delay: 0.7s; }
        .pink-star-9 { top: 88%; left: 18%; width: 3px; height: 3px; animation: float 5.1s infinite; animation-delay: 1.6s; }
        .pink-star-10 { top: 12%; left: 48%; width: 2px; height: 2px; animation: floatAround 3.8s infinite; animation-delay: 0.4s; }
        .pink-star-11 { top: 22%; left: 32%; width: 4px; height: 4px; animation: float 4.2s infinite; animation-delay: 1.9s; }
        .pink-star-12 { top: 32%; left: 68%; width: 3px; height: 3px; animation: floatAround 5.7s infinite; animation-delay: 0.6s; }

        /* Blue star positions and sizes */
        .blue-star-1 { top: 14%; left: 18%; width: 3px; height: 3px; animation: float 4.1s infinite; animation-delay: 0.3s; }
        .blue-star-2 { top: 24%; left: 82%; width: 2px; height: 2px; animation: floatAround 3.7s infinite; animation-delay: 1.2s; }
        .blue-star-3 { top: 34%; left: 28%; width: 5px; height: 5px; animation: float 5.3s infinite; animation-delay: 0.9s; }
        .blue-star-4 { top: 44%; left: 78%; width: 3px; height: 3px; animation: floatAround 4.8s infinite; animation-delay: 1.6s; }
        .blue-star-5 { top: 54%; left: 12%; width: 2px; height: 2px; animation: float 3.4s infinite; animation-delay: 0.6s; }
        .blue-star-6 { top: 64%; left: 88%; width: 4px; height: 4px; animation: floatAround 5.1s infinite; animation-delay: 1.9s; }
        .blue-star-7 { top: 74%; left: 32%; width: 3px; height: 3px; animation: float 4.4s infinite; animation-delay: 1.4s; }
        .blue-star-8 { top: 84%; left: 68%; width: 2px; height: 2px; animation: floatAround 3.8s infinite; animation-delay: 0.8s; }
        .blue-star-9 { top: 94%; left: 22%; width: 4px; height: 4px; animation: float 5.6s infinite; animation-delay: 1.7s; }
        .blue-star-10 { top: 4%; left: 58%; width: 3px; height: 3px; animation: floatAround 4.2s infinite; animation-delay: 0.5s; }
        .blue-star-11 { top: 26%; left: 38%; width: 2px; height: 2px; animation: float 3.9s infinite; animation-delay: 2.0s; }
        .blue-star-12 { top: 36%; left: 72%; width: 5px; height: 5px; animation: floatAround 5.8s infinite; animation-delay: 0.7s; }

        /* Yellow star positions and sizes */
        .yellow-star-1 { top: 11%; left: 25%; width: 4px; height: 4px; animation: float 4.3s infinite; animation-delay: 0.4s; }
        .yellow-star-2 { top: 21%; left: 75%; width: 2px; height: 2px; animation: floatAround 3.9s infinite; animation-delay: 1.3s; }
        .yellow-star-3 { top: 31%; left: 35%; width: 3px; height: 3px; animation: float 5.1s infinite; animation-delay: 1.0s; }
        .yellow-star-4 { top: 41%; left: 85%; width: 5px; height: 5px; animation: floatAround 4.6s infinite; animation-delay: 1.7s; }
        .yellow-star-5 { top: 51%; left: 15%; width: 2px; height: 2px; animation: float 3.7s infinite; animation-delay: 0.7s; }
        .yellow-star-6 { top: 61%; left: 95%; width: 4px; height: 4px; animation: floatAround 5.4s infinite; animation-delay: 2.0s; }
        .yellow-star-7 { top: 71%; left: 25%; width: 3px; height: 3px; animation: float 4.8s infinite; animation-delay: 1.5s; }
        .yellow-star-8 { top: 81%; left: 75%; width: 2px; height: 2px; animation: floatAround 3.4s infinite; animation-delay: 0.9s; }
        .yellow-star-9 { top: 91%; left: 35%; width: 4px; height: 4px; animation: float 5.7s infinite; animation-delay: 1.8s; }
        .yellow-star-10 { top: 1%; left: 65%; width: 3px; height: 3px; animation: floatAround 4.1s infinite; animation-delay: 0.6s; }
        .yellow-star-11 { top: 29%; left: 45%; width: 2px; height: 2px; animation: float 3.8s infinite; animation-delay: 2.1s; }
        .yellow-star-12 { top: 39%; left: 65%; width: 5px; height: 5px; animation: floatAround 5.9s infinite; animation-delay: 0.8s; }
      `}</style>

      <div className="relative z-10">
        {/* Navigation */}
       <nav className="w-full z-50 flex justify-center pt-4 px-4">
  <motion.div
    className="p-2 rounded-2xl bg-black/20 backdrop-blur-lg border border-white/10 shadow-lg relative overflow-hidden"
    initial="initial"
    whileHover="hover"
  >
    <ul className="flex items-center gap-1 sm:gap-2 relative z-10">
      {/* Home */}
      <li className="relative">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="nav-link px-3 py-2 sm:px-4 text-sm sm:text-base text-gray-300 hover:text-white transition-colors rounded-xl border-none cursor-pointer bg-transparent flex flex-col items-center group"
        >
          Home
          <span className="nav-underline group-hover:w-full"></span>
        </button>
      </li>
      {/* About */}
      <li className="relative">
        <button
          onClick={() => scrollToSection(aboutRef)}
          className="nav-link px-3 py-2 sm:px-4 text-sm sm:text-base text-gray-300 hover:text-white transition-colors rounded-xl border-none cursor-pointer bg-transparent flex flex-col items-center group"
        >
          About
          <span className="nav-underline group-hover:w-full"></span>
        </button>
      </li>
      {/* Experience */}
      <li className="relative">
        <button
          onClick={() => scrollToSection(experienceRef)}
          className="nav-link px-3 py-2 sm:px-4 text-sm sm:text-base text-gray-300 hover:text-white transition-colors rounded-xl border-none cursor-pointer bg-transparent flex flex-col items-center group"
        >
          Experience
          <span className="nav-underline group-hover:w-full"></span>
        </button>
      </li>
      {/* Certs */}
      <li className="relative">
        <button
          onClick={() => scrollToSection(certificationsRef)}
          className="nav-link px-3 py-2 sm:px-4 text-sm sm:text-base text-gray-300 hover:text-white transition-colors rounded-xl border-none cursor-pointer bg-transparent flex flex-col items-center group"
        >
          Certs
          <span className="nav-underline group-hover:w-full"></span>
        </button>
      </li>
      {/* Projects */}
      <li className="relative">
        <button
          onClick={() => scrollToSection(projectsRef)}
          className="nav-link px-3 py-2 sm:px-4 text-sm sm:text-base text-gray-300 hover:text-white transition-colors rounded-xl border-none cursor-pointer bg-transparent flex flex-col items-center group"
        >
          Projects
          <span className="nav-underline group-hover:w-full"></span>
        </button>
      </li>
      {/* Contact Me */}
      <li className="relative">
        <button
          onClick={() => scrollToSection(footerRef)}
          className="nav-link px-3 py-2 sm:px-4 text-sm sm:text-base text-gray-300 hover:text-white transition-colors rounded-xl border-none cursor-pointer bg-transparent flex flex-col items-center group"
        >
          Contact Me
          <span className="nav-underline group-hover:w-full"></span>
        </button>
      </li>
    </ul>
  </motion.div>
</nav>


     {/* Hero Section */}
<section className="flex items-start justify-center px-4 sm:px-6 lg:px-8 pt-20 sm:pt-32 pb-32 relative overflow-hidden">
  <div className="max-w-7xl mx-auto w-full">
    <div className="text-center relative">
      <div className="relative z-10">
        <div className="flex items-center justify-center mb-2">
  <p className="text-5xl md:text-6xl text-white font-semibold">Hello, I'm Jack</p>
</div>


        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-8 leading-tight">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-teal-300 bg-clip-text text-transparent inline-block">
            FULL-STACK DEVELOPER
          </span>
          <br />
          <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400 bg-clip-text text-transparent inline-block">
            & BLOCKCHAIN ENTHUSIAST.
          </span>
        </h1>

        {/* Typing Animation: Always under main text */}
        <div className="mb-4 md:mb-8">
          <p className="text-2xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 font-mono whitespace-nowrap">
             {typingText}
          </p>

        </div>

        {/* Social Icons: Always row, centered, with spacing */}
<div className="flex flex-row items-center justify-center space-x-6 mt-6">
  <Button
    variant="ghost"
    size="icon"
    className="w-16 h-16 p-0 hover:scale-110 transition-all duration-300"
    onClick={() => window.open("https://www.linkedin.com/in/jack-pastor-816157223/", "_blank")}
  >
    <img
      src="/assets/linkedin.png"
      alt="LinkedIn"
      className="h-12 w-12 object-contain"
      width={48}
      height={48}
      draggable={false}
    />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    className="w-16 h-16 p-0 hover:scale-110 transition-all duration-300"
    onClick={() => window.open("https://github.com/AverageNftEnjoyer", "_blank")}
  >
    <img
      src="/assets/rainbowgithub.png"
      alt="GitHub"
      className="h-36 w-36 object-contain"
      width={48}
      height={48}
      draggable={false}
    />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    className="w-16 h-16 p-0 hover:scale-110 transition-all duration-300"
    onClick={() => window.open("/assets/JackPastorResume.pdf", "_blank")}
  >
    <img
      src="/assets/colorfulresume.png"
      alt="Resume"
      className="h-12 w-12 object-contain"
      width={48}
      height={48}
      draggable={false}
    />
  </Button>
</div>
      </div>
    </div>
  </div>
</section>



        {/* About Section */}
     <section
  id="about"
  ref={aboutRef}
  className="py-16 px-4 sm:px-6 lg:px-8 opacity-0 translate-y-8"
>

          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-gray-400 text-lg mb-2">Get To Know More</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white">About Me</h2>
            <div className="w-16 h-1 bg-white mx-auto mt-2"></div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="flex justify-center">
                <div className="w-80 h-80 rounded-full overflow-hidden transition-all duration-300">
                  <img
                    src="/assets/profile.jpg"
                    alt="Jack Pastor profile picture"
                    width={320}
                    height={320}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/30 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/60">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <span className="text-2xl">💼</span>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Experience</h3>
                      <p className="text-gray-400">
                        3 years Frontend Development
                        <br />2 years Backend Development
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-orange-500/30 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/60">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🎓</span>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Education</h3>
                      <p className="text-gray-400">
                        B.Sc. Enterprise Technology Integration
                        <br />
                        Minor Data Science
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-gray-300 text-lg leading-relaxed">
                  <p>
                    Graduated from Penn State with a{" "}
                    <span className="text-orange-400 font-semibold">Bachelor's degree</span> in{" "}
                    <span className="text-green-400 font-semibold">Enterprise Technology Integration</span> with a minor
                    in <span className="text-purple-400 font-semibold">Data Science</span>. I have a wide array of
                    experience from <span className="text-purple-400 font-semibold">Front-end Web Development</span> to{" "}
                    <span className="text-orange-400 font-semibold">Back-end Data Programming</span>. My main interest
                    outside of working and studying is{" "}
                    <span className="text-blue-400 font-semibold">Web3 and Blockchain Technology</span>. I love working with{" "}
                    <span className="text-green-400 font-semibold">Cloud Based Solutions</span> and plan to continue
                    expanding my knowledge in this area. I am always looking for new challenges and opportunities to grow.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

       {/* Professional Experience Section */}
<section
  ref={experienceRef}
  className="py-16 px-4 sm:px-6 lg:px-8 opacity-0 translate-y-8"
>
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-12">
      <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-teal-300 bg-clip-text text-transparent mb-2">
        Professional Experience
      </h2>
      <div className="w-16 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-teal-300 mx-auto"></div>
    </div>

    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Experience Card 1 */}
      <Card className="bg-white/5 border border-blue-500/30 hover:bg-white/10 hover:border-green-400/50 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/60 group">
        <CardContent className="p-8 relative">
          {/* External link icon */}
          <a
            href="https://www.wesco.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-4 right-4 z-30 hover:scale-110 transition-transform text-gray-400 hover:text-white"
            aria-label="Visit company website"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
          <div className="flex items-start space-x-6">
            {/* LOGO ONLY, NO BOX */}
            <div className="w-16 h-16 flex items-center justify-center">
              <img
                src="/assets/WESCO.png"
                alt="WESCO logo"
                className="w-10 h-10 object-contain"
                width={40}
                height={40}
                draggable={false}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-2xl mb-2">IT & Digital Associate</h3>
              <p className="text-green-400 text-lg mb-2">WESCO</p>
              <p className="text-gray-400 text-sm mb-4">June 2025 - Current</p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1">•</span>
                  <span>Integrated enterprise processes to optimize workflows</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1">•</span>
                  <span>Developed cloud-based solutions using Microsoft Azure</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1">•</span>
                  <span>Automated AI/ML model training workflows with Azure OpenAI</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1">•</span>
                  <span>Worked within Oracle to increase DDP performence</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience Card 2 */}
      <Card className="bg-white/5 border border-teal-500/30 hover:bg-white/10 hover:border-teal-400/50 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/60 group">
        <CardContent className="p-8 relative">
          {/* External link icon */}
          <a
            href="https://www.wesco.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-4 right-4 z-30 hover:scale-110 transition-transform text-gray-400 hover:text-white"
            aria-label="Visit company website"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
          <div className="flex items-start space-x-6">
            {/* LOGO ONLY, NO BOX */}
            <div className="w-16 h-16 flex items-center justify-center">
              <img
                src="/assets/WESCO.png"
                alt="WESCO logo"
                className="w-10 h-10 object-contain"
                width={40}
                height={40}
                draggable={false}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-2xl mb-2">Data Engineering Intern</h3>
              <p className="text-green-400 text-lg mb-2">WESCO</p>
              <p className="text-gray-400 text-sm mb-4">May 2024 - October 2024</p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="text-cyan-400 mr-3 mt-1">•</span>
                  <span>Developed over 60 complex SQL queries to extract, manipulate, and analyze large datasets.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-400 mr-3 mt-1">•</span>
                  <span>Conducted data quality assessments to identify and resolve data inconsistencies within the data lake.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-400 mr-3 mt-1">•</span>
                  <span>Utilized Power BI to visualize analytics and provide data driven insights.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-400 mr-3 mt-1">•</span>
                  <span>Migrated infrastructure to from legacy to Databricks</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience Card 3 */}
      <Card className="bg-white/5 border border-purple-500/30 hover:bg-white/10 hover:border-purple-400/50 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/60 group">
        <CardContent className="p-8 relative">
          {/* External link icon */}
          <a
            href="https://www.kingdom-nft.com/" 
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-4 right-4 z-30 hover:scale-110 transition-transform text-gray-400 hover:text-white"
            aria-label="Visit company website"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
          <div className="flex items-start space-x-6">
            {/* LOGO ONLY, NO BOX */}
            <div className="w-16 h-16 flex items-center justify-center">
              <img
                src="/assets/kingdomnft.jpg"
                alt="Kingdom NFT logo"
                className="w-10 h-10 object-contain"
                width={40}
                height={40}
                draggable={false}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-2xl mb-2">Blockchain Consultant</h3>
              <p className="text-purple-400 text-lg mb-2">Kingdom NFT</p>
              <p className="text-gray-400 text-sm mb-4">March 2021 - December 2023</p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3 mt-1">•</span>
                  <span>Advised over 800 clients on NFT market trends, investment opportunities, and digital asset management to optimize their portfolios.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3 mt-1">•</span>
                  <span>Developed and implemented innovative strategies for upcoming NFT mints, significantly increasing client visibility, sales and success.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3 mt-1">•</span>
                  <span>Facilitated over $350,000 in WEB-3 transactions across multiple blockchains within two years.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3 mt-1">•</span>
                  <span>Optimized performance and profitability standards</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</section>

                {/* Projects Section */}
          <section
            ref={projectsRef}
            className="py-16 px-4 sm:px-6 lg:px-8 opacity-0 translate-y-8"
          >
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  Featured Projects
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-400 via-blue-400 to-purple-400 mx-auto"></div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

                {/* Project Card 1 */}
                <Card className="bg-white/5 border border-green-500/30 hover:bg-white/10 hover:border-green-400/50 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/60 group relative overflow-hidden">
                  <CardContent className="p-6 relative z-10">
                    {/* Title Row with Icons Right-Aligned */}
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-white font-bold text-xl">AI Query Companion Tool</h3>
                      <div className="flex items-center gap-3">
                        <a
                          href="https://github.com/AverageNftEnjoyer/QueryAnalyzer"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:scale-110 transition-transform text-gray-400 hover:text-white"
                          aria-label="View GitHub repository"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                        <a
                          href="https://querycompanion.vercel.app/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:scale-110 transition-transform text-gray-400 hover:text-white"
                          aria-label="View Live Site"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-3">AI Integration</p>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                      Production-ready SQL diff engine with embedded AI explanations, stakeholder summaries, and real time change classification.
                    </p>

                    {/* Tech Pills */}
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                        React
                      </span>
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                        Azure
                      </span>
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                        OpenAI
                      </span>
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                        TypeScript
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Project Card 2 */}
                <Card className="bg-white/5 border border-blue-500/30 hover:bg-white/10 hover:border-blue-400/50 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/60 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-6 relative z-10">
                    <h3 className="text-white font-bold text-xl mb-3">AI Task Manager</h3>
                    <p className="text-gray-400 text-sm mb-3">November 2024</p>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                      Intelligent project management application with AI-powered task prioritization and automated scheduling.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                        Python
                      </span>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                        FastAPI
                      </span>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                        OpenAI
                      </span>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                        SQL
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Project Card 3 */}
                <Card className="bg-white/5 border border-purple-500/30 hover:bg-white/10 hover:border-purple-400/50 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/60 group relative overflow-hidden md:col-span-2 lg:col-span-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-6 relative z-10">
                    <h3 className="text-white font-bold text-xl mb-3">Blockchain Wallet</h3>
                    <p className="text-gray-400 text-sm mb-3">September 2024 - December 2024</p>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                      In progress.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                        Solidity
                      </span>
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                        Web3.js
                      </span>
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                        React
                      </span>
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                        TypeScript
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Certifications Section */}
          <section
            ref={certificationsRef}
            className="py-16 px-4 sm:px-6 lg:px-8 opacity-0 translate-y-8"
          >
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2">
                  Certifications
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto"></div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {/* Certification Card 1 */}
                <Card className="bg-white/5 border border-blue-500/30 hover:bg-white/10 hover:border-blue-400/50 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/60 group">
                  <CardContent className="p-6 relative">
                    <a
                      href="/assets/az900.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-4 right-4 z-30 hover:scale-110 transition-transform text-gray-400 hover:text-white"
                      aria-label="View certificate"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors duration-300">
                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center overflow-hidden">
                          <img
                            src="/assets/microsoft.png"
                            alt="Microsoft Logo"
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg mb-1">Azure AZ-900 Fundamentals</h3>
                        <p className="text-gray-400 text-sm mb-2">Microsoft</p>
                        <p className="text-gray-500 text-sm"> Completed July 2025</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Certification Card 2 */}
                <Card className="bg-white/5 border border-orange-500/30 hover:bg-white/10 hover:border-orange-400/50 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/60 group">
                  <CardContent className="p-6 relative">
                    <a
                      href="/assets/az104.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-4 right-4 z-30 hover:scale-110 transition-transform text-gray-400 hover:text-white"
                      aria-label="View certificate"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30 transition-colors duration-300">
                        <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center overflow-hidden">
                          <img
                            src="/assets/microsoft.png"
                            alt="Microsoft Logo"
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg mb-1">Azure AZ-104 Administrator</h3>
                        <p className="text-gray-400 text-sm mb-2">Microsoft</p>
                        <p className="text-gray-500 text-sm">Future</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Certification Card 3 */}
                <Card className="bg-white/5 border border-purple-500/30 hover:bg-white/10 hover:border-purple-400/50 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/60 group md:col-span-2 lg:col-span-1">
                  <CardContent className="p-6 relative">
                    <a
                      href="/assets/AI-900.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-4 right-4 z-30 hover:scale-110 transition-transform text-gray-400 hover:text-white"
                      aria-label="View certificate"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors duration-300">
                        <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center overflow-hidden">
                          <img
                            src="/assets/microsoft.png"
                            alt="Microsoft Logo"
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg mb-1"> Azure AI-900 Fundamentals</h3>
                        <p className="text-gray-400 text-sm mb-2">Microsoft</p>
                        <p className="text-gray-500 text-sm">Completed August 2025</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

        {/* Expertise Section */}
        <section
          ref={skillsRef}
          className="py-16 px-4 sm:px-6 lg:px-8 opacity-0 translate-y-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-black-100 to-white bg-clip-text text-transparent">
            Expertise
          </h2>
              <div className="w-16 h-1 bg-white mx-auto mt-2"></div>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/60">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">Front-end Development</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {frontendSkills.map((skill) => (
                      <div key={skill.name} className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-400 hover:scale-110 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/50 cursor-pointer">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{skill.name}</h4>
                          <p className="text-gray-400 text-sm">{skill.level}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/60">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">Back-end Development</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {backendSkills.map((skill) => (
                      <div key={skill.name} className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-400 hover:scale-110 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/50 cursor-pointer">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{skill.name}</h4>
                          <p className="text-gray-400 text-sm">{skill.level}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer ref={footerRef} className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Always <span className="text-purple-400">reaching</span>{" "}
                  <span className="text-green-400">higher</span>
                </h2>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Explore</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="#about" className="text-gray-400 hover:text-white transition-colors">
                      About Me
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      Resume
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Lets Connect!</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="https://www.linkedin.com/in/jack-pastor-816157223/"
                      target="_blank"
                      className="text-gray-400 hover:text-white transition-colors flex items-center"
                      rel="noreferrer"
                    >
                      <Linkedin className="h-4 w-4 mr-2" /> LinkedIn
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/AverageNftEnjoyer"
                      target="_blank"
                      className="text-gray-400 hover:text-white transition-colors flex items-center"
                      rel="noreferrer"
                    >
                      <Github className="h-4 w-4 mr-2" /> GitHub
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://leetcode.com/u/AverageNFTEnjoyer/"
                      target="_blank"
                      className="text-gray-400 hover:text-white transition-colors flex items-center"
                      rel="noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" /> LeetCode
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const skills = {
  "Programming Languages": [
    "JavaScript",
    "TypeScript",
    "Python",
    "Golang",
    "C++",
    "C",
    "Solidity",
  ],
  "Frameworks & Libraries": [
    "React",
    "Vite",
    "Django",
    "Flask",
    "FastAPI",
    "Flutter",
    "Tailwind CSS",
    "React Native",
  ],
  "Tools & Platforms": [
    "Git",
    "Docker",
    "Azure",
    "Firebase",
    "Postman",
    "Supabase",
  ],
  Databases: ["MySQL", "PostgreSQL", "MongoDB", "Firestore"],
};

const Skills = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Skills
          </h1>
          <p className="text-xl text-muted-foreground mb-12">
            Technologies and tools I work with
          </p>

          <div ref={ref} className="space-y-12">
            {Object.entries(skills).map(([category, items], categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: categoryIndex * 0.1, duration: 0.6 }}
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-primary">▹</span>
                  {category}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.map((skill, index) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={inView ? { opacity: 1, scale: 1 } : {}}
                      transition={{
                        delay: categoryIndex * 0.1 + index * 0.05,
                        duration: 0.4,
                      }}
                      whileHover={{ scale: 1.05 }}
                      className="bg-card border border-border rounded-lg p-4 text-center hover:border-primary transition-all cursor-default group"
                    >
                      <div className="text-4xl mb-3 group-hover:animate-float">
                        💻
                      </div>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {skill}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Decorative elements */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Skills;

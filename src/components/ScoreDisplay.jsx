import { useAtom } from 'jotai';
import { scoreAtom, comboAtom, highScoreAtom } from '../atoms/gameAtoms';
import { motion } from 'framer-motion';

export default function ScoreDisplay() {
  const [score] = useAtom(scoreAtom);
  const [combo] = useAtom(comboAtom);
  const [highScore] = useAtom(highScoreAtom);

  return (
    <div className="text-center">
      <motion.p 
        className="text-6xl text-white font-silkscreen"
        key={score}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {score}
      </motion.p>
      
      {combo > 0 && (
        <motion.p 
          className="text-lg text-[#FFD700] mt-2"
          key={combo}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          COMBO {combo}x
        </motion.p>
      )}
    </div>
  );
}
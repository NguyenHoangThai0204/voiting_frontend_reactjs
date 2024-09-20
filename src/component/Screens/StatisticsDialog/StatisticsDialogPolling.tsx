import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { getPollById } from '../../../api/CallApi';
import { Poll } from '../../../typeObject';
import './StatisticsDialogPolling.css';

interface StatisticsDialogProps {
  open: boolean;
  handleClose: () => void;
  pollId: string;
}

const animalEmojis = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐧', '🐦', '🐤', '🐣', '🐺',
  '🦄', '🐴', '🦓', '🐘', '🦏', '🦛', '🐪', '🐫', '🦙', '🦒',
  '🦘', '🦔', '🐾', '🐉', '🐲', '🐊', '🐢', '🦎', '🐍', '🐅',
  '🐆', '🦕', '🦖', '🐋', '🐳', '🐬', '🦈', '🐟', '🐠', '🐡',
  '🦐', '🦑', '🦞', '🦀', '🐙'
];

const StatisticsDialogPolling: React.FC<StatisticsDialogProps> = ({ open, handleClose, pollId }) => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [animalEmojisState, setAnimalEmojisState] = useState<string[]>([]);
  const [remainingTime, setRemainingTime] = useState<string | null>(null);

  useEffect(() => {
    const fetchVote = async () => {
      try {
        const response = await getPollById(pollId);
        setPoll(response.data);
        const total = response.data.options.reduce((acc, option) => acc + option.votes.length, 0);
        setTotalVotes(total);

        const selectedEmojis = response.data.options.map(() =>
          animalEmojis[Math.floor(Math.random() * animalEmojis.length)]
        );
        setAnimalEmojisState(selectedEmojis);
      } catch (error) {
        console.error('Error fetching vote data:', error);
      }
    };

    if (pollId && open) {
      fetchVote();
    }
  }, [pollId, open]);

  const getRemainingTime = (endTime: string) => {
    const timeLeft = new Date(endTime).getTime() - new Date().getTime();
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (poll && poll.timeEnd) {
        const { days, hours, minutes, seconds } = getRemainingTime(poll.timeEnd);
        setRemainingTime(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [poll]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth="md">
      <DialogTitle>Live Race Statistics</DialogTitle>
      <DialogContent>
        {poll ? (
          <div>
            {poll.options.map((option, index) => {
              const votePercentage = (option.votes.length / totalVotes) * 100 || 0;
              return (
                <div key={option._id} className="race-container">
                  <div className="animal-name">{option.contentOption}</div>
                  <div className="track">
                    <div className="animal" style={{ width: `${votePercentage}%` }}>
                      {animalEmojisState[index]}
                    </div>
                  </div>
                  <div className="vote-count">{option.votes.length} votes</div>
                </div>
              );
            })}
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </DialogContent>
      <DialogActions style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ textAlign: "left" }}>
          {remainingTime ? (
            <p style={{ fontWeight: "bold" }}>Remaining time: {remainingTime}</p>
          ) : null}
        </div>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatisticsDialogPolling;

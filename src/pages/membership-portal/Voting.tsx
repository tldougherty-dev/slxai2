import { Card, CardContent } from '@/components/ui/card';
import { PageTitle } from '@/components/PageTitle';
import { useIsLandscape } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Clock, Vote, CheckCircle2, XCircle, History } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  getActiveVotes,
  getPastVotes,
  castVote,
  calculateVoteResult,
  Vote as VoteType,
  VoteOption,
} from '@/data/votes';
import { trackEvent, trackPageView } from '@/lib/analytics';
import { addNotification } from '@/lib/notifications';
import { realtimeManager } from '@/lib/realtime';
import { getCurrentUser, getUserRole } from '@/lib/auth';
import { hasPermission } from '@/lib/roles';
import { isUserVotingRepresentative } from '@/data/membersData';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isClosed: boolean;
}

export default function Voting() {
  const { toast } = useToast();
  const user = getCurrentUser();
  const isLandscape = useIsLandscape();
  const userRole = getUserRole();
  const [isVotingRep, setIsVotingRep] = useState<boolean>(false);
  const [isCheckingVotingRep, setIsCheckingVotingRep] = useState(true);
  const canVote = hasPermission(userRole, 'canVote') && isVotingRep;
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: TimeRemaining }>({});
  const [votes, setVotes] = useState<VoteType[]>([]);
  const [pastVotes, setPastVotes] = useState<VoteType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState<{ [voteId: string]: boolean }>({});
  const [voteConfirmation, setVoteConfirmation] = useState<{ voteId: string; optionId: string; optionLabel: string; voteTitle: string } | null>(null);

  // Check if user is a voting representative
  useEffect(() => {
    const checkVotingRep = async () => {
      if (!user?.email) {
        setIsCheckingVotingRep(false);
        setIsVotingRep(false);
        return;
      }
      
      try {
        const isRep = await isUserVotingRepresentative(user.email);
        setIsVotingRep(isRep);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error checking voting representative status:', error);
        }
        setIsVotingRep(false);
      } finally {
        setIsCheckingVotingRep(false);
      }
    };
    
    checkVotingRep();
  }, [user?.email]);

  // Track page view
  useEffect(() => {
    trackPageView('/membership-portal/voting', user?.id);
  }, [user?.id]);

  // Load votes on mount
  useEffect(() => {
    const loadVotes = async () => {
      setIsLoading(true);
      try {
        const [activeVotes, pastVotesData] = await Promise.all([
          getActiveVotes(),
          getPastVotes(),
        ]);
        setVotes(activeVotes);
        setPastVotes(pastVotesData);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading votes:', error);
        }
        toast({
          title: "Error",
          description: "Failed to load votes. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadVotes();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = realtimeManager.subscribe(async (update) => {
      if (update.type === 'vote' || update.type === 'vote_result') {
        const [activeVotes, pastVotesData] = await Promise.all([
          getActiveVotes(),
          getPastVotes(),
        ]);
        setVotes(activeVotes);
        setPastVotes(pastVotesData);
      }
    });
    return unsubscribe;
  }, []);

  // Refresh votes periodically
  useEffect(() => {
    const refreshVotes = async () => {
      try {
        const [activeVotes, pastVotesData] = await Promise.all([
          getActiveVotes(),
          getPastVotes(),
        ]);
        setVotes(activeVotes);
        setPastVotes(pastVotesData);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error refreshing votes:', error);
        }
      }
    };
    
    refreshVotes();
    const interval = setInterval(refreshVotes, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateTimers = () => {
      const newTimeRemaining: { [key: string]: TimeRemaining } = {};
      votes.forEach((vote) => {
        const now = new Date().getTime();
        const end = vote.endTime.getTime();
        const diff = end - now;

        if (diff <= 0) {
          newTimeRemaining[vote.id] = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isClosed: true
          };
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          newTimeRemaining[vote.id] = {
            days,
            hours,
            minutes,
            seconds,
            isClosed: false
          };
        }
      });
      setTimeRemaining(newTimeRemaining);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);

    return () => clearInterval(interval);
  }, [votes]);

  const handleVoteClick = (voteId: string, optionId: string) => {
    if (!canVote) {
      toast({
        title: "Cannot vote",
        description: "Only voting representatives can cast votes. Please contact your organization administrator if you need voting access.",
        variant: "destructive",
      });
      return;
    }
    
    const vote = votes.find(v => v.id === voteId);
    const option = vote?.options.find(o => o.id === optionId);
    if (vote && option) {
      setVoteConfirmation({ voteId, optionId, optionLabel: option.label, voteTitle: vote.title });
    }
  };

  const handleVoteConfirm = async () => {
    if (!voteConfirmation) return;
    
    const { voteId, optionId } = voteConfirmation;
    setVoteConfirmation(null);
    
    try {
      setIsVoting(prev => ({ ...prev, [voteId]: true }));
      const vote = votes.find(v => v.id === voteId);
      const option = vote?.options.find(o => o.id === optionId);
      
      const success = await castVote(voteId, optionId, user?.id);
      if (success) {
        // Track analytics
        trackEvent({
          type: 'vote',
          category: 'voting',
          action: 'vote_cast',
          label: `${vote?.title} - ${option?.label}`,
          userId: user?.id,
        });

        // Trigger real-time update
        realtimeManager.triggerUpdate({
          type: 'vote',
          id: voteId,
          action: 'updated',
          data: { optionId },
          timestamp: new Date(),
        });

        // Send notification to other users (in production, only to relevant users)
        if (vote) {
          await addNotification({
            type: 'vote',
            title: 'New vote cast',
            message: `A vote was cast on "${vote.title}"`,
            userId: user?.id,
            link: '/membership-portal/voting',
          });
        }

        // Refresh votes to show updated counts
        const [activeVotes, pastVotesData] = await Promise.all([
          getActiveVotes(),
          getPastVotes(),
        ]);
        setVotes(activeVotes);
        setPastVotes(pastVotesData);
        toast({
          title: "Vote cast successfully",
          description: `Your vote for "${option?.label}" has been recorded. Thank you for participating!`,
        });
      } else {
        toast({
          title: "Unable to vote",
          description: "Only voting representatives can cast votes. This vote may also be closed or invalid.",
          variant: "destructive",
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error casting vote:', error);
      }
      toast({
        title: "Error",
        description: "Failed to cast vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(prev => ({ ...prev, [voteId]: false }));
    }
  };

  const getTotalVotes = (options: VoteOption[]) => {
    return options.reduce((sum, option) => sum + option.votes, 0);
  };

  // Memoize past votes calculations
  const pastVotesWithResults = useMemo(() => {
    return pastVotes.map((vote) => {
      const winningOption = vote.options.length > 0 
        ? vote.options.reduce((prev, current) => 
            (current.votes > prev.votes) ? current : prev
          )
        : { id: '', label: 'No options', votes: 0 };
      const result = calculateVoteResult(vote);
      const isPass = result === 'passed';
      const totalVotes = getTotalVotes(vote.options);
      
      return {
        ...vote,
        winningOption,
        isPass,
        totalVotes,
      };
    });
  }, [pastVotes]);

  if (isLoading) {
    return (
      <div className="space-y-2 md:space-y-4">
        <PageTitle title="Voting" fullWidthLandscape={true} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading votes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0 md:space-y-4">
      <PageTitle title="Voting" fullWidthLandscape={true} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {votes.map((vote) => {
          const totalVotes = getTotalVotes(vote.options);
          const timer = timeRemaining[vote.id];
          const isClosed = timer?.isClosed || false;

          return (
            <Card key={vote.id} className="glass-card floating-hover">
              <CardContent className="p-2 md:p-4">
                {/* Header with Timer */}
                <div className="mb-2 md:mb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{vote.title}</h3>
                        <p className="text-xs text-gray-600 dark:text-white">{vote.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-white">
                        <Vote className="h-3 w-3 dark:text-white" />
                        <span>{vote.organization}</span>
                      </div>
                    </div>

                  {/* Improved Visual Timer */}
                  {timer && !timer.isClosed ? (
                    <div className="bg-gradient-to-br from-electric-blue/20 to-blue-500/20 rounded-lg p-3 sm:p-4 border-2 border-electric-blue/30">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-electric-blue dark:text-white" />
                        <span className="text-xs font-semibold text-electric-blue dark:text-white uppercase">Time Remaining</span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 sm:gap-3">
                        {timer.days > 0 && (
                          <>
                            <div className="flex flex-col items-center">
                              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 min-w-[50px] sm:min-w-[60px] text-center shadow-sm">
                                <div className="text-xl sm:text-2xl font-bold text-electric-blue dark:text-white">{String(timer.days).padStart(2, '0')}</div>
                                <div className="text-[10px] sm:text-xs text-gray-600 dark:text-white mt-0.5">Days</div>
                              </div>
                            </div>
                            <span className="text-lg sm:text-xl font-bold text-electric-blue dark:text-white">:</span>
                          </>
                        )}
                        <div className="flex flex-col items-center">
                          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 min-w-[50px] sm:min-w-[60px] text-center shadow-sm">
                            <div className="text-xl sm:text-2xl font-bold text-electric-blue dark:text-white">{String(timer.hours).padStart(2, '0')}</div>
                                <div className="text-[10px] sm:text-xs text-gray-600 dark:text-white mt-0.5">Hours</div>
                          </div>
                        </div>
                        <span className="text-lg sm:text-xl font-bold text-electric-blue dark:text-white">:</span>
                        <div className="flex flex-col items-center">
                          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 min-w-[50px] sm:min-w-[60px] text-center shadow-sm">
                            <div className="text-xl sm:text-2xl font-bold text-electric-blue dark:text-white">{String(timer.minutes).padStart(2, '0')}</div>
                                <div className="text-[10px] sm:text-xs text-gray-600 dark:text-white mt-0.5">Mins</div>
                          </div>
                        </div>
                        <span className="text-lg sm:text-xl font-bold text-electric-blue dark:text-white">:</span>
                        <div className="flex flex-col items-center">
                          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 min-w-[50px] sm:min-w-[60px] text-center shadow-sm">
                            <div className="text-xl sm:text-2xl font-bold text-electric-blue dark:text-white">{String(timer.seconds).padStart(2, '0')}</div>
                                <div className="text-[10px] sm:text-xs text-gray-600 dark:text-white mt-0.5">Secs</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
                      <XCircle className="h-6 w-6 text-gray-400 dark:text-white mx-auto mb-2" />
                      <span className="text-sm font-semibold text-gray-600 dark:text-white">Voting Closed</span>
                    </div>
                  )}
                </div>

                {/* Voting Options */}
                <div className="space-y-2">
                  {vote.options.map((option) => {
                    const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                    return (
                      <div key={option.id} className="space-y-1.5 p-2 rounded-lg bg-electric-blue/5 border border-electric-blue/10">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{option.label}</span>
                          <span className="text-xs text-gray-600 dark:text-white">
                            {option.votes} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-white/30 backdrop-blur-sm rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-electric-blue to-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Vote Buttons */}
                {!vote.hasVoted && !isClosed && canVote && (
                  <div className="mt-3 pt-3 border-t border-electric-blue/20">
                    <div className="flex gap-2">
                      {vote.options.map((option) => (
                        <Button
                          key={option.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleVoteClick(vote.id, option.id)}
                          disabled={isVoting[vote.id]}
                          className="flex-1 text-xs sm:text-sm py-2 sm:py-1.5"
                          aria-label={`Vote ${option.label} on ${vote.title}`}
                        >
                          {isVoting[vote.id] ? 'Voting...' : `Vote ${option.label}`}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                {!canVote && !vote.hasVoted && !isCheckingVotingRep && (
                  <div className="mt-3 pt-3 border-t border-electric-blue/20">
                    <div className="text-xs text-gray-500 dark:text-white text-center">
                      Only voting representatives can cast votes. Please contact your organization administrator if you need voting access.
                    </div>
                  </div>
                )}

                {vote.hasVoted && (
                  <div className="mt-3 pt-3 border-t border-electric-blue/20">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-white">
                      <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                      <span>You have already voted</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {votes.length === 0 && (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <Vote className="h-12 w-12 text-gray-400 dark:text-white mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No active votes</h3>
            <p className="text-gray-600 dark:text-white mb-4">There are no active votes at this time</p>
            <p className="text-sm text-gray-500 dark:text-white">Check back later or view voting history below</p>
          </CardContent>
        </Card>
      )}

      {/* Voting History */}
      {pastVotes.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-center gap-2 py-4">
            <History className="h-5 w-5 text-gray-700 dark:text-white" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Voting History</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pastVotesWithResults.map((vote) => {
              const { winningOption, isPass, totalVotes } = vote;
              
              return (
                <Card 
                  key={vote.id} 
                  className={`glass-card floating-hover border-l-4 ${
                    isPass ? 'border-l-green-500' : 'border-l-red-500'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {isPass ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                          )}
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{vote.title}</h3>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-white mb-2">{vote.description}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-white">
                          <span>Ended {Math.floor((Date.now() - vote.endTime.getTime()) / (1000 * 60 * 60 * 24))} days ago</span>
                          <span>•</span>
                          <span>{totalVotes} total votes</span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isPass 
                          ? 'bg-green-100 text-green-700 border border-green-300' 
                          : 'bg-red-100 text-red-700 border border-red-300'
                      }`}>
                        {isPass ? 'PASSED' : 'FAILED'}
                      </div>
                    </div>

                    {/* Results */}
                    <div className="space-y-2 mt-4">
                      {vote.options.map((option) => {
                        const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                        const isWinner = option.id === winningOption.id && totalVotes > 0;
                        
                        return (
                          <div 
                            key={option.id} 
                            className={`space-y-1.5 p-2 rounded-lg border ${
                              isWinner && isPass
                                ? 'bg-green-50 border-green-200'
                                : isWinner && !isPass
                                ? 'bg-red-50 border-red-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">{option.label}</span>
                                {isWinner && (
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                                    isPass 
                                      ? 'bg-green-200 text-green-800' 
                                      : 'bg-red-200 text-red-800'
                                  }`}>
                                    Winner
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-600">
                                {option.votes} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-white/50 backdrop-blur-sm rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  isWinner && isPass
                                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                                    : isWinner && !isPass
                                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                                    : 'bg-gradient-to-r from-gray-400 to-gray-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Vote Confirmation Dialog */}
      <AlertDialog open={!!voteConfirmation} onOpenChange={() => setVoteConfirmation(null)}>
        <AlertDialogContent className="bg-white border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Confirm Your Vote</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              You are about to vote for <strong>"{voteConfirmation?.optionLabel}"</strong> on <strong>"{voteConfirmation?.voteTitle}"</strong>.
              <br />
              <br />
              This action cannot be changed once submitted. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => setVoteConfirmation(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleVoteConfirm}
              className="bg-electric-blue hover:bg-electric-blue/90 text-white"
            >
              Confirm Vote
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

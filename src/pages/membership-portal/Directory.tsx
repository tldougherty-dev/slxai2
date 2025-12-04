import { Card, CardContent } from '@/components/ui/card';
import { PageTitle } from '@/components/PageTitle';
import { Input } from '@/components/ui/input';
import { Search, Building2, MapPin, Users, Hand } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { Member } from '@/data/members';
import { getAllMembers } from '@/data/membersData';
import { CountryFlag } from '@/components/CountryFlag';
import { trackEvent, trackPageView } from '@/lib/analytics';
import { getCurrentUser } from '@/lib/auth';
import { useIsLandscape } from '@/hooks/use-mobile';

export default function Directory() {
  const user = getCurrentUser();
  const isLandscape = useIsLandscape();
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load members from Supabase
  useEffect(() => {
    const loadMembers = async () => {
      setIsLoading(true);
      try {
        const data = await getAllMembers();
        setMembers(data);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading members:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadMembers();
  }, []);

  // Track page view
  useEffect(() => {
    trackPageView('/membership-portal/directory', user?.id);
  }, [user?.id]);

  // Track search
  useEffect(() => {
    if (searchQuery) {
      trackEvent({
        type: 'search',
        category: 'directory',
        action: 'search',
        label: searchQuery,
        userId: user?.id,
      });
    }
  }, [searchQuery, user?.id]);

  const filteredMembers = useMemo(() => members.filter(
    (member) =>
      // Only show active members in public directory (exclude pending)
      member.status !== 'pending' &&
      (member.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.pocName.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [members, searchQuery]);

  // Calculate statistics - only count active individuals (exclude pending)
  const stats = useMemo(() => {
    const totalOrganizations = filteredMembers.length;
    const totalIndividualMembers = filteredMembers.reduce((sum, member) => 
      sum + (member.members?.filter(p => p.status !== 'pending').length || 0), 0
    );
    return { totalOrganizations, totalIndividualMembers };
  }, [filteredMembers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0 md:space-y-6">
      <PageTitle title="Member Directory" fullWidthLandscape={true} />
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex gap-2 sm:gap-3">
          <Card className="glass-card border-electric-blue/20 flex-1 sm:flex-none">
            <CardContent className="p-2 md:p-3 lg:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-electric-blue" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-white">Organizations</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrganizations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-electric-blue/20 flex-1 sm:flex-none">
            <CardContent className="p-2 md:p-3 lg:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-electric-blue" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-white">Individual Members</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalIndividualMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          id="directory-search"
          name="directory-search"
          placeholder="Search by organization, country, or POC name..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Members List */}
      <div className={`grid ${isLandscape ? 'grid-cols-3' : 'grid-cols-1'} md:grid-cols-2 lg:grid-cols-4 gap-4`}>
        {filteredMembers.map((member) => (
          <Card
            key={member.id}
            className="glass-card floating-hover cursor-pointer"
          >
            <CardContent className="p-4">
              <Link to={`/membership-portal/directory/${member.id}`}>
                <div className="flex flex-col items-center text-center space-y-3">
                  {member.logo ? (
                    <img
                      src={member.logo}
                      alt={member.organizationName}
                      className="h-16 w-16 rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center border">
                      <Building2 className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="w-full">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {member.organizationName}
                    </h3>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600 dark:text-white">
                        <CountryFlag country={member.country} size="sm" />
                        <span className="line-clamp-1">{member.country}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600 dark:text-white">
                        <Hand className="h-3 w-3" />
                        <span className="line-clamp-1">{member.pocName}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600 dark:text-white">
                        <Users className="h-3 w-3" />
                        <span>{member.memberCount} {member.memberCount === 1 ? 'member' : 'members'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchQuery ? 'No members found matching your search' : 'No members found'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


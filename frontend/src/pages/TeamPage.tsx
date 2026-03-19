import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTeam, inviteUser, type Team } from '../services/teamService';

const TeamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getTeam(id).then(setTeam).finally(() => setLoading(false));
    }
  }, [id]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id && email) {
      try {
        const updatedTeam = await inviteUser(id, email);
        setTeam(updatedTeam);
        setEmail('');
      } catch (error) {
        console.error('Failed to invite user', error);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!team) return <div>Team not found</div>;

  return (
    <div className="page-container">
      <h1>{team.name}</h1>
      <p>{team.description}</p>
      
      <h2>Members</h2>
      <ul>
        {team.users?.map((user: any) => (
          <li key={user.id}>{user.firstName} {user.lastName} ({user.email}) - {user.role}</li>
        ))}
      </ul>

      <h2>Invite Member</h2>
      <form onSubmit={handleInvite}>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="User Email" 
          required 
        />
        <button type="submit">Invite</button>
      </form>
    </div>
  );
};

export default TeamPage;

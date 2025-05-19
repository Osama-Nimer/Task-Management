import axios from "axios";

export async function gitCheck(repoLink){
    if (!repoLink || !/^https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/.test(repoLink)) {
        return  ('GitHub Repo not Valid' );
      }  
    
      try {
        const response = await axios.get(repoLink, {
          validateStatus: () => true
        });
    
        if (response.status === 200) {
            return 'public';
          } else if (response.status === 404 || response.status === 403) {
            return 'private_or_not_found';
          } else {
            return 'unexpected_status_' + response.status;
          }
    
      } catch (err) {
        console.error('GitHub check error:', err.message);
        return 'connection_error';
      }
}
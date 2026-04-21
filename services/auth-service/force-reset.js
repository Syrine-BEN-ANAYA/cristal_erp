const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGODB_URI = 'mongodb://localhost:27017/auth-service';

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  mustChangePassword: Boolean,
});

const User = mongoose.model('User', userSchema);

async function forceReset() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    // Compter les utilisateurs avant suppression
    const countBefore = await User.countDocuments();
    console.log(`📊 Utilisateurs avant: ${countBefore}`);
    
    // SUPPRIMER complètement l'ancien SUPER_ADMIN
    const deleteResult = await User.deleteMany({ username: 'superadmin' });
    console.log(`🗑️ Supprimé: ${deleteResult.deletedCount} utilisateur(s) avec username "superadmin"`);
    
    // Créer un NOUVEAU SUPER_ADMIN
    const newPassword = 'S12345678n';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const newUser = new User({
      username: 'superadmin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      mustChangePassword: false,
    });
    
    await newUser.save();
    console.log('✅ NOUVEAU SUPER_ADMIN créé avec succès');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Username: superadmin');
    console.log('🔑 Mot de passe:', newPassword);
    console.log('🎭 Rôle: SUPER_ADMIN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Vérification immédiate
    const savedUser = await User.findOne({ username: 'superadmin' });
    if (savedUser) {
      const isValid = await bcrypt.compare(newPassword, savedUser.password);
      console.log(`🔐 Vérification du mot de passe: ${isValid ? '✅ VALIDE' : '❌ INVALIDE'}`);
    } else {
      console.log('❌ ERREUR: Utilisateur non trouvé après création');
    }
    
    const countAfter = await User.countDocuments();
    console.log(`📊 Utilisateurs après: ${countAfter}`);
    
    await mongoose.disconnect();
    console.log('✅ Déconnecté de MongoDB');
    
    if (savedUser && await bcrypt.compare(newPassword, savedUser.password)) {
      console.log('\n🎉 Tout est prêt ! Redémarrez votre backend avec:');
      console.log('npm run start:dev');
    } else {
      console.log('\n⚠️ Problème détecté, vérifiez les logs.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

forceReset();
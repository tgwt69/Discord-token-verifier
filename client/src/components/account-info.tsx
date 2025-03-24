import { DiscordUser } from "@shared/schema";
import { 
  formatDiscordTimestamp, 
  formatPhoneNumber, 
  getAvatarUrl 
} from "@/lib/utils";
import { 
  Calendar, 
  Check, 
  CheckCircle,
  Mail, 
  Phone, 
  Shield,
  User,
  BadgeCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeIn, slideInUp, staggerChildren } from "@/lib/animation";

interface AccountInfoProps {
  user: DiscordUser;
}

export default function AccountInfo({ user }: AccountInfoProps) {
  const userAvatar = getAvatarUrl(user.id, user.avatar);
  
  // Format user creation date from ID
  const createdAt = formatDiscordTimestamp(user.id);
  
  // Format phone
  const formattedPhone = formatPhoneNumber(user.phone);
  
  // Check if 2FA is enabled
  const mfaEnabled = user.mfa_enabled ? "Yes" : "No";

  const detailItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <motion.div 
      className="p-6"
      variants={staggerChildren}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="bg-green-50 dark:bg-green-900/20 border border-success/20 rounded-xl p-4 mb-5 flex items-center"
        variants={slideInUp}
      >
        <motion.div 
          className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center mr-4"
          whileHover={{ scale: 1.1 }}
        >
          <CheckCircle className="h-5 w-5 text-success" />
        </motion.div>
        <div>
          <h3 className="font-semibold text-success">Valid Token</h3>
          <p className="text-sm text-gray-600 dark:text-neutral-300">This token is valid and working properly</p>
        </div>
      </motion.div>

      <motion.div 
        className="space-y-5"
        variants={staggerChildren}
      >
        {/* User Profile Section */}
        <motion.div 
          className="flex items-center pb-4 border-b border-neutral-200 dark:border-neutral-700"
          variants={fadeIn}
        >
          <motion.div 
            className="w-20 h-20 rounded-full bg-neutral-200 dark:bg-neutral-700 flex-shrink-0 overflow-hidden border-2 border-primary/30 shadow-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.05, borderColor: "rgba(var(--primary), 0.6)" }}
          >
            <motion.img 
              src={userAvatar} 
              className="w-full h-full object-cover" 
              alt={`${user.username}'s avatar`}
              initial={{ filter: "blur(10px)" }} 
              animate={{ filter: "blur(0px)" }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
          <div className="ml-5">
            <motion.div 
              className="flex items-center"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-bold text-xl">{user.username}</h3>
              <span className="text-secondary ml-2 text-sm bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">#{user.discriminator}</span>
            </motion.div>
            <motion.div 
              className="flex items-center mt-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-md text-secondary font-mono flex items-center">
                <User className="h-3 w-3 mr-1.5 text-primary/60" />
                {user.id}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Account Details */}
        <motion.div 
          className="space-y-4"
          variants={staggerChildren}
        >
          <motion.h4 
            className="font-semibold text-primary/90 flex items-center"
            variants={fadeIn}
          >
            <BadgeCheck className="h-4 w-4 mr-1.5" />
            Account Details
          </motion.h4>
          
          <motion.div
            className="grid gap-3 bg-white dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm"
            variants={staggerChildren}
          >
            <motion.div 
              className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
              variants={detailItem}
            >
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mr-3 shadow-sm">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">Email</span>
              </div>
              <span className="text-sm font-medium bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">{user.email || "Not provided"}</span>
            </motion.div>

            <motion.div 
              className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
              variants={detailItem}
            >
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mr-3 shadow-sm">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">Phone</span>
              </div>
              <span className="text-sm font-medium bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">{formattedPhone}</span>
            </motion.div>

            <motion.div 
              className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
              variants={detailItem}
            >
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mr-3 shadow-sm">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">2FA Enabled</span>
              </div>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${user.mfa_enabled ? 'bg-success/10 text-success' : 'bg-neutral-100 dark:bg-neutral-800'}`}>
                {mfaEnabled}
              </span>
            </motion.div>

            <motion.div 
              className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
              variants={detailItem}
            >
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mr-3 shadow-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">Creation Date</span>
              </div>
              <span className="text-sm font-medium bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">{createdAt}</span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Account Status */}
        <motion.div 
          className="rounded-xl overflow-hidden mt-4 shadow-sm"
          variants={fadeIn}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="px-4 py-3 bg-success/10 text-success font-medium flex items-center justify-center">
            <Check className="h-5 w-5 mr-2" />
            <span>Account in good standing</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

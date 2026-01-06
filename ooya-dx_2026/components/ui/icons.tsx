import { LucideProps } from 'lucide-react'
import {
  BarChart3,
  Users,
  RefreshCw,
  Smartphone,
  Shield,
  Rocket,
  Check,
  ArrowRight,
  ChevronDown,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Menu,
  X,
  Star,
  Heart,
  Zap,
  TrendingUp,
  Globe,
  MessageCircle,
  Settings,
  CreditCard,
  User,
  LogOut,
  Home,
  FileText,
  UserPlus,
  Key,
  MailCheck
} from 'lucide-react'

export const Icons = {
  // ナビゲーション
  menu: Menu,
  close: X,
  home: Home,
  user: User,
  settings: Settings,
  logout: LogOut,
  
  // ビジネス
  chart: BarChart3,
  users: Users,
  refresh: RefreshCw,
  smartphone: Smartphone,
  shield: Shield,
  rocket: Rocket,
  trending: TrendingUp,
  globe: Globe,
  zap: Zap,
  
  // フォーム
  mail: Mail,
  lock: Lock,
  eye: Eye,
  eyeOff: EyeOff,
  
  // UI
  check: Check,
  arrowRight: ArrowRight,
  chevronDown: ChevronDown,
  loader: Loader2,
  star: Star,
  heart: Heart,
  message: MessageCircle,
  file: FileText,
  x: X,
  
  // 認証
  userAdd: UserPlus,
  key: Key,
  mailCheck: MailCheck,
  
  // 決済
  creditCard: CreditCard,
}

// アイコンのプロップスタイプ
export type IconProps = LucideProps

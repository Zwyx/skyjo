import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { useChat } from "@/contexts/ChatContext"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { useVoteKick } from "@/contexts/VoteKickContext"
import { VariantProps, cva } from "class-variance-authority"
import {
  MessageSquareIcon,
  MessageSquareOffIcon,
  UserRoundXIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { SkyjoPlayerToJson } from "shared/types/skyjoPlayer"

const containerVariants = cva("flex flex-col items-center", {
  variants: {
    size: {
      small: " gap-0",
      normal: " gap-2",
    },
  },
  defaultVariants: {
    size: "normal",
  },
})

// Ajouter une sdh pour le mobile pour que la taille soit plus adaptée
const imageVariants = cva("select-none", {
  variants: {
    size: {
      small: " size-8 sm:size-10",
      normal: " size-12 sdh:sm:size-16 mdh:md:size-[6.25rem]",
    },
  },
  defaultVariants: {
    size: "normal",
  },
})

const textVariants = cva(
  "text-slate-900 dark:text-primary text-center text-ellipsis overflow-hidden whitespace-nowrap",
  {
    variants: {
      size: {
        small: "text-sm w-20",
        normal: "text-lg w-[6.25rem]",
      },
    },
    defaultVariants: {
      size: "normal",
    },
  },
)

interface UserAvatarProps extends VariantProps<typeof containerVariants> {
  player: SkyjoPlayerToJson
  allowContextMenu?: boolean
}

const UserAvatar = ({
  player,
  size = "normal",
  allowContextMenu = true,
}: UserAvatarProps) => {
  const tAvatar = useTranslations("utils.avatar")
  const { player: currentPlayer } = useSkyjo()

  const isCurrentPlayer = currentPlayer.socketId === player.socketId
  const disableContextMenu =
    !allowContextMenu || !player.name || isCurrentPlayer

  return (
    <ContextMenu>
      <ContextMenuTrigger
        disabled={disableContextMenu}
        className={containerVariants({ size })}
      >
        <Image
          src={`/avatars/${player.avatar}.png`}
          width={size === "small" ? 40 : 100}
          height={size === "small" ? 40 : 100}
          alt={tAvatar(player.avatar)}
          title={tAvatar(player.avatar)}
          className={imageVariants({ size })}
          priority
        />
        {player.name && <p className={textVariants({ size })}>{player.name}</p>}
      </ContextMenuTrigger>
      {!disableContextMenu && <UserContextMenu player={player} />}
    </ContextMenu>
  )
}

const UserContextMenu = ({ player }: { player: SkyjoPlayerToJson }) => {
  const { unmutePlayer, mutePlayer, mutedPlayers } = useChat()
  const { actions } = useVoteKick()
  const { game } = useSkyjo()
  const t = useTranslations("components.Avatar")

  const handleKickPlayer = () => {
    if (game.players.length <= 2) return

    actions.initiateKickVote(player.id)
  }

  return (
    <ContextMenuContent>
      {game.players.length > 2 && (
        <ContextMenuItem onClick={handleKickPlayer}>
          <UserRoundXIcon className="w-4 h-4 mr-2" />
          {t("context-menu.kick")}
        </ContextMenuItem>
      )}
      {mutedPlayers.includes(player.name) ? (
        <ContextMenuItem onClick={() => unmutePlayer(player.name)}>
          <MessageSquareIcon className="w-4 h-4 mr-2" />
          {t("context-menu.unmute")}
        </ContextMenuItem>
      ) : (
        <ContextMenuItem onClick={() => mutePlayer(player.name)}>
          <MessageSquareOffIcon className="w-4 h-4 mr-2" />
          {t("context-menu.mute")}
        </ContextMenuItem>
      )}
    </ContextMenuContent>
  )
}

export default UserAvatar

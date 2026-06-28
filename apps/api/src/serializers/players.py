# Local
from models import Player
from schemas.categories import CategoryRead
from schemas.player_media import PlayerMediaRead
from schemas.players import PlayerRead


def serialize_player(player: Player) -> PlayerRead:
    return PlayerRead(
        id=player.id,
        full_name=player.full_name,
        height=player.height,
        date_of_birth=player.date_of_birth,
        nationality=player.nationality,
        last_club=player.last_club,
        created_at=player.created_at,
        updated_at=player.updated_at,
        categories=[
            CategoryRead.model_validate(link.category)
            for link in player.player_categories
        ],
        media=[PlayerMediaRead.model_validate(media) for media in player.player_media],
    )

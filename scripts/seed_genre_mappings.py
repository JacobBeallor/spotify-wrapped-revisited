#!/usr/bin/env python3
"""
Seed the genre_mappings table with subgenre → broad genre mappings.

This maps Spotify's 452+ specific genres to 15 broader categories for easier analysis.
"""

import duckdb
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "spotify.duckdb"


# Define broad genre categories with pattern-based rules
def categorize_genre(genre: str) -> tuple[str, str]:
    """
    Categorize a genre into a broad category.
    Returns (broad_genre, confidence) tuple.
    """
    g = genre.lower()

    # Metal (check first - very specific)
    if "metal" in g or "deathcore" in g or "djent" in g:
        return ("Metal", "high")

    # Rock and subgenres
    if any(
        x in g
        for x in [
            "rock",
            "grunge",
            "britpop",
            "shoegaze",
            "madchester",
            "aor",
            "new wave",
            "jam band",
            "southern gothic",
            "neo-psychedelic",
        ]
    ):
        return ("Rock", "high")

    # Hip Hop / Rap
    if any(
        x in g
        for x in [
            "hip hop",
            "rap",
            "trap",
            "drill",
            "boom bap",
            "crunk",
            "g-funk",
            "horrorcore",
            "freestyle",
        ]
    ):
        return ("Hip Hop/Rap", "high")

    # Electronic / Dance
    if any(
        x in g
        for x in [
            "house",
            "techno",
            "trance",
            "edm",
            "electronic",
            "electronica",
            "drum and bass",
            "dubstep",
            "ambient",
            "downtempo",
            "idm",
            "breakbeat",
            "garage",
            "bass",
            "hardstyle",
            "hardcore",
            "eurodance",
            "future bass",
            "synthwave",
            "vaporwave",
            "chillwave",
            "nightcore",
            "trip hop",
            "big beat",
            "big room",
            "electro",
            "electroacoustic",
            "electroclash",
            "chillstep",
            "darkwave",
            "hi-nrg",
            "new rave",
            "moombahton",
            "frenchcore",
        ]
    ):
        # Exception: jazz house, jazz fusion house go to Jazz
        if "jazz" in g and "house" in g:
            return ("Jazz", "medium")
        return ("Electronic/Dance", "high")

    # Jazz
    if "jazz" in g or "bop" in g:
        return ("Jazz", "high")

    # Blues
    if ("blues" in g and "rock" not in g) or "boogie-woogie" in g:
        return ("Blues", "high")

    # Soul / R&B
    if any(
        x in g for x in ["soul", "r&b", "r & b", "motown", "philly soul", "doo-wop"]
    ):
        return ("Soul/R&B", "high")

    # Funk
    if "funk" in g and "house" not in g:
        return ("Funk", "high")

    # Folk / Americana / Singer-Songwriter
    if any(
        x in g
        for x in [
            "folk",
            "americana",
            "singer-songwriter",
            "bluegrass",
            "roots",
            "anti-folk",
            "neofolk",
            "newgrass",
            "sea shanties",
            "cajun",
            "zydeco",
        ]
    ):
        return ("Folk/Americana", "high")

    # Country
    if "country" in g or "honky tonk" in g or "tejano" in g or "red dirt" in g:
        return ("Country", "high")

    # Indie / Alternative
    if any(
        x in g for x in ["indie", "alternative", "bedroom", "lo-fi", "lofi", "slowcore"]
    ):
        # Exceptions
        if "folk" in g:
            return ("Folk/Americana", "high")
        if "electronic" in g or "house" in g:
            return ("Electronic/Dance", "high")
        return ("Indie/Alternative", "high")

    # Pop
    if "pop" in g or "chanson" in g or "variété" in g or "schlager" in g:
        # Exceptions for specific pop subgenres
        if any(
            x in g for x in ["k-pop", "j-pop", "hyperpop", "synthpop", "electropop"]
        ):
            return ("Pop", "high")
        if "indie" in g:
            return ("Indie/Alternative", "high")
        if "folk" in g:
            return ("Folk/Americana", "high")
        if "country" in g:
            return ("Country", "high")
        return ("Pop", "high")

    # Reggae / Caribbean
    if any(
        x in g
        for x in [
            "reggae",
            "ska",
            "dancehall",
            "dub",
            "ragga",
            "rocksteady",
            "calypso",
            "soca",
            "reggaeton",
        ]
    ):
        return ("Reggae/Caribbean", "high")

    # Latin
    if any(
        x in g
        for x in [
            "latin",
            "salsa",
            "bachata",
            "merengue",
            "cumbia",
            "mariachi",
            "tango",
            "bossa nova",
            "samba",
            "mpb",
            "pagode",
            "trova",
            "vallenato",
            "urbano",
            "corridos",
            "bolero",
            "cha cha cha",
            "candombe",
            "parang",
            "techengue",
        ]
    ):
        return ("Latin", "high")

    # Classical / Orchestral
    if any(
        x in g
        for x in [
            "classical",
            "baroque",
            "opera",
            "symphony",
            "orchestral",
            "concerto",
            "chamber",
            "renaissance",
            "medieval",
            "choral",
            "gregorian",
            "impressionism",
            "expressionism",
            "minimalism",
            "early music",
            "ballet",
        ]
    ):
        return ("Classical", "high")

    # World Music
    if any(
        x in g
        for x in [
            "african",
            "afro",
            "celtic",
            "indian",
            "bollywood",
            "bhangra",
            "flamenco",
            "fado",
            "klezmer",
            "world",
            "ethnic",
            "traditional",
            "native",
            "aboriginal",
            "balkan",
            "turkish",
            "arabic",
            "persian",
            "chinese",
            "japanese",
            "korean",
            "thai",
            "vietnamese",
            "indonesian",
            "moroccan",
            "egyptian",
            "ethiopian",
            "gnawa",
            "kollywood",
            "tollywood",
            "desi",
            "punjabi",
            "tamil",
            "telugu",
            "hindi",
            "opm",
            "pinoy",
            "harana",
            "kundiman",
            "taiwanese",
            "gengetone",
            "highlife",
            "afrobeat",
            "afrobeats",
            "afropop",
            "raï",
            "chaabi",
            "enka",
            "kayokyoku",
            "shibuya-kei",
            "mizrahi",
        ]
    ):
        return ("World", "high")

    # Gospel / Christian / Worship
    if any(
        x in g
        for x in [
            "gospel",
            "christian",
            "worship",
            "ccm",
            "catholic",
            "devotional",
            "bhajan",
        ]
    ):
        return ("Gospel/Christian", "high")

    # Holiday / Seasonal
    if any(x in g for x in ["christmas", "holiday", "villancicos"]):
        return ("Holiday", "high")

    # Punk
    if ("punk" in g and "funk" not in g) or "riot grrrl" in g or "queercore" in g:
        return ("Punk", "high")

    # Disco
    if "disco" in g:
        return ("Disco", "high")

    # Funk (second check for pure funk)
    if "funk" in g:
        return ("Funk", "high")

    # Jazz (catch remaining jazz-like genres)
    if any(x in g for x in ["swing", "big band", "bebop", "ragtime", "brass band"]):
        return ("Jazz", "medium")

    # Soundtracks / Instrumental
    if any(
        x in g
        for x in [
            "soundtrack",
            "score",
            "instrumental",
            "musicals",
            "anime",
            "video game",
        ]
    ):
        return ("Soundtrack/Score", "high")

    # Spoken Word / Comedy
    if any(x in g for x in ["spoken word", "comedy", "audiobook", "podcast"]):
        return ("Spoken Word/Comedy", "high")

    # Children's / Lullaby
    if any(x in g for x in ["children's", "lullaby", "nursery"]):
        return ("Children's", "high")

    # Experimental / Avant-Garde
    if any(
        x in g
        for x in [
            "experimental",
            "avant-garde",
            "noise",
            "industrial",
            "musique concrète",
            "plunderphonics",
            "drone",
        ]
    ):
        return ("Experimental", "high")

    # Easy Listening / Lounge
    if any(
        x in g
        for x in [
            "easy listening",
            "lounge",
            "exotica",
            "yacht rock",
            "adult standards",
            "quiet storm",
            "smooth",
        ]
    ):
        return ("Easy Listening", "medium")

    # Emo / Screamo
    if "emo" in g or "screamo" in g:
        return ("Emo/Screamo", "high")

    # New Age
    if any(x in g for x in ["new age", "meditation", "ambient", "space music"]):
        return ("New Age", "medium")

    # If nothing matches, return Other
    return ("Other", "low")


def main():
    print("Connecting to database...")
    con = duckdb.connect(str(DB_PATH))

    # Get all unique genres from the artists table
    print("Fetching all unique genres...")
    results = con.execute(
        """
        WITH unnested_genres AS (
            SELECT UNNEST(STRING_SPLIT(genres, ',')) AS genre
            FROM artists
            WHERE genres IS NOT NULL
        )
        SELECT DISTINCT genre
        FROM unnested_genres
        ORDER BY genre
    """
    ).fetchall()

    genres = [row[0] for row in results]
    print(f"Found {len(genres)} unique genres")

    # Categorize all genres
    print("Categorizing genres...")
    mappings = []
    for genre in genres:
        broad_genre, confidence = categorize_genre(genre)
        mappings.append((genre, broad_genre, confidence, None))

    # Clear existing mappings
    print("Clearing existing mappings...")
    con.execute("DELETE FROM genre_mappings")

    # Insert new mappings
    print("Inserting new mappings...")
    con.executemany(
        """
        INSERT INTO genre_mappings (subgenre, broad_genre, confidence, notes)
        VALUES (?, ?, ?, ?)
        """,
        mappings,
    )

    # Show summary
    print("\n" + "=" * 60)
    print("GENRE MAPPINGS SEEDED SUCCESSFULLY")
    print("=" * 60)

    result = con.execute(
        """
        SELECT 
            broad_genre,
            COUNT(*) as subgenre_count
        FROM genre_mappings
        GROUP BY broad_genre
        ORDER BY subgenre_count DESC
    """
    ).fetchall()

    print(f"\nTotal subgenres mapped: {len(mappings)}")
    print(f"\nMappings by broad genre:")
    print(f"{'Broad Genre':<30} {'Subgenres':>10}")
    print("-" * 42)
    for broad_genre, count in result:
        print(f"{broad_genre:<30} {count:>10}")
    print("=" * 60)

    # Show some examples
    print("\nExample mappings (first 20):")
    examples = con.execute(
        """
        SELECT subgenre, broad_genre, confidence
        FROM genre_mappings
        ORDER BY subgenre
        LIMIT 20
    """
    ).fetchall()

    print(f"{'Subgenre':<30} {'→ Broad Genre':<25} {'Confidence':<10}")
    print("-" * 65)
    for subgenre, broad, conf in examples:
        print(f"{subgenre:<30} → {broad:<25} {conf:<10}")

    con.close()
    print(f"\n✓ Mappings saved to {DB_PATH}")


if __name__ == "__main__":
    main()

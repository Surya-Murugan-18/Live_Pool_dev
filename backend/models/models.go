package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name         string             `bson:"name"          json:"name"`
	Email        string             `bson:"email"         json:"email"`
	PasswordHash string             `bson:"passwordHash"  json:"-"`
	// AvatarUrl stores a base64 data-URI (≤ 200 KB after client-side resize)
	// or an empty string when no avatar has been set.
	AvatarUrl string    `bson:"avatarUrl" json:"avatarUrl"`
	CreatedAt time.Time `bson:"createdAt" json:"createdAt"`
}

type Option struct {
	ID    string `bson:"id"    json:"id"`
	Label string `bson:"label" json:"label"`
	Votes int    `bson:"votes" json:"votes"`
}

type Poll struct {
	ID           primitive.ObjectID `bson:"_id,omitempty"  json:"id"`
	OwnerID      primitive.ObjectID `bson:"ownerId"        json:"-"`
	Question     string             `bson:"question"       json:"question"`
	Options      []Option           `bson:"options"        json:"options"`
	Status       string             `bson:"status"         json:"status"`
	AllowOneVote bool               `bson:"allowOneVote"   json:"allowOneVote"`
	CreatedAt    time.Time          `bson:"createdAt"      json:"createdAt"`
	UpdatedAt    time.Time          `bson:"updatedAt"      json:"updatedAt"`
}

type Vote struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	PollID    primitive.ObjectID `bson:"pollId"`
	OptionID  string             `bson:"optionId"`
	VoterKey  string             `bson:"voterKey"`
	CreatedAt time.Time          `bson:"createdAt"`
}
